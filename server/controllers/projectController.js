const Project = require('../models/Project');
const ProjectSubmission = require('../models/ProjectSubmission');
const Module = require('../models/Module');
const User = require('../models/User');
const Group = require('../models/Group');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Create a project
 * @route   POST /api/projects
 * @access  Private/Teacher/Admin
 */
const createProject = async (req, res) => {
  try {
    const { name, description, moduleIds, moduleId, groupId, studentIds, type, deliverables, dueDate, instructions, category, autoUnlockNextOnValidation } = req.body;

    // Support both single moduleId (backward compatibility) and moduleIds array
    const modulesArray = moduleIds || (moduleId ? [moduleId] : []);
    
    if (modulesArray.length === 0) {
      return res.status(400).json({ message: 'At least one module is required' });
    }

    // Verify modules exist
    const modules = await Module.find({ _id: { $in: modulesArray } });
    if (modules.length !== modulesArray.length) {
      return res.status(404).json({ message: 'One or more modules not found' });
    }

    // Verify group exists if provided
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
    }

    // Verify students exist if provided
    if (studentIds && studentIds.length > 0) {
      const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
      if (students.length !== studentIds.length) {
        return res.status(400).json({ message: 'Some student IDs are invalid' });
      }
    }

    const project = await Project.create({
      name,
      description,
      modules: modulesArray,
      group: groupId || null,
      students: studentIds || [],
      type: type || 'project',
      deliverables: deliverables || [],
      dueDate: dueDate || null,
      instructions: instructions || '',
      category: category || null,
      autoUnlockNextOnValidation: autoUnlockNextOnValidation || false
    });

    // Notify students
    const notifyUserIds = [];
    if (groupId) {
      const group = await Group.findById(groupId).populate('students');
      if (group.students) {
        notifyUserIds.push(...group.students.map(s => s._id));
      }
    }
    if (studentIds && studentIds.length > 0) {
      notifyUserIds.push(...studentIds);
    }

    if (notifyUserIds.length > 0) {
      await Promise.all(notifyUserIds.map(userId =>
        createNotification({
          userId,
          type: NOTIFICATION_TYPES.MODULE_ASSIGNED,
          title: 'Nouveau projet assigné',
          message: `Un nouveau projet "${name}" a été assigné`,
          relatedEntity: { entityType: 'project', entityId: project._id }
        })
      ));
    }

    await project.populate('module', 'title');
    await project.populate('group', 'name');
    await project.populate('students', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const { groupId, studentId, moduleId, type, status, category } = req.query;
    let query = {};

    // Filter by group
    if (groupId) {
      query.group = groupId;
    }

    // Filter by student
    if (studentId) {
      query.$or = [
        { students: studentId },
        { group: { $in: await Group.find({ students: studentId }).distinct('_id') } }
      ];
    }

    // Filter by module
    if (moduleId) {
      query.modules = moduleId;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const projects = await Project.find(query)
      .populate('modules', 'title description')
      .populate('group', 'name')
      .populate('students', 'name email avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my projects
 * @route   GET /api/projects/my
 * @access  Private
 */
const getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let projects = [];

    if (userRole === 'student') {
      // Get projects where student is assigned (individually or via group)
      const user = await User.findById(userId);
      const groupIds = user.groupId ? [user.groupId] : [];

      projects = await Project.find({
        $or: [
          { students: userId },
          { group: { $in: groupIds } }
        ],
        status: { $ne: 'archived' }
      })
        .populate('modules', 'title description')
        .populate('group', 'name')
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    } else if (userRole === 'teacher') {
      // Get projects from groups where teacher is assigned
      const groups = await Group.find({ teacher: userId });
      const groupIds = groups.map(g => g._id);

      projects = await Project.find({
        group: { $in: groupIds },
        status: { $ne: 'archived' }
      })
        .populate('modules', 'title description')
        .populate('group', 'name')
        .populate('students', 'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    } else if (userRole === 'admin') {
      // Admin sees all projects
      projects = await Project.find({ status: { $ne: 'archived' } })
        .populate('modules', 'title description')
        .populate('group', 'name')
        .populate('students', 'name email')
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('modules', 'title description')
      .populate('group', 'name description')
      .populate('students', 'name email avatar')
      .populate('category', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get submissions if student or teacher/admin
    if (req.user.role === 'student') {
      const submission = await ProjectSubmission.findOne({
        project: project._id,
        student: req.user._id
      });
      project.submission = submission;
    } else if (req.user.role === 'teacher' || req.user.role === 'admin') {
      const submissions = await ProjectSubmission.find({ project: project._id })
        .populate('student', 'name email avatar')
        .populate('gradedBy', 'name email')
        .sort({ submittedAt: -1 });
      project.submissions = submissions;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit project
 * @route   POST /api/projects/:id/submit
 * @access  Private/Student
 */
const submitProject = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit projects' });
    }

    const { comment } = req.body;
    const uploadedFiles = req.files || [];
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if student is assigned to this project
    const user = await User.findById(req.user._id);
    const isAssigned = project.students.includes(req.user._id) ||
      (user.groupId && project.group && project.group.toString() === user.groupId.toString());

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this project' });
    }

    // Process uploaded files
    const fileData = uploadedFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      uploadedAt: Date.now()
    }));

    // Create or update submission
    let submission = await ProjectSubmission.findOne({
      project: project._id,
      student: req.user._id
    });

    if (submission) {
      // Merge with existing files
      submission.files = [...(submission.files || []), ...fileData];
      submission.status = 'submitted';
      submission.submittedAt = Date.now();
      if (comment) submission.comment = comment;
    } else {
      submission = await ProjectSubmission.create({
        project: project._id,
        student: req.user._id,
        files: fileData,
        status: 'submitted',
        submittedAt: Date.now(),
        comment: comment || null
      });
    }

    await submission.save();

    // Notify teacher/admin
    if (user.groupId) {
      const group = await Group.findById(user.groupId).populate('teacher');
      if (group.teacher) {
        await createNotification({
          userId: group.teacher._id,
          type: NOTIFICATION_TYPES.QUIZ_SUBMITTED,
          title: 'Projet soumis',
          message: `${req.user.name} a soumis le projet "${project.name}"`,
          relatedEntity: { entityType: 'project', entityId: project._id }
        });
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Grade project
 * @route   POST /api/projects/:id/grade
 * @access  Private/Teacher/Admin
 */
const gradeProject = async (req, res) => {
  try {
    const { studentId, grade, comment, status, revisionNotes } = req.body;
    const project = await Project.findById(req.params.id).populate('modules');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const submission = await ProjectSubmission.findOne({
      project: project._id,
      student: studentId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const previousGrade = submission.grade;
    submission.grade = grade;
    submission.comment = comment;
    submission.gradedBy = req.user._id;
    submission.gradedAt = Date.now();
    if (status) submission.status = status;
    if (revisionNotes) submission.revisionNotes = revisionNotes;

    await submission.save();

    // Notify student
    await createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.GRADE_RECEIVED,
      title: 'Projet noté',
      message: `Votre projet "${project.name}" a été noté: ${grade}/100`,
      relatedEntity: { entityType: 'project', entityId: project._id }
    });

    // Auto-unlock logic: If project is validated (grade >= passing threshold, typically 60 or 70)
    // and autoUnlockNextOnValidation is true, unlock next module
    const ModuleApproval = require('../models/ModuleApproval');
    const passingGrade = 60; // Minimum grade to consider project validated
    
    if (grade >= passingGrade && (project.autoUnlockNextOnValidation || 
        (project.modules && project.modules.length > 0 && project.modules.some(m => m.autoUnlockOnProjectValidation)))) {
      
      // For each module associated with this project, find and unlock the next module
      for (const module of project.modules) {
        if (module.autoUnlockOnProjectValidation) {
          // Find next module by order
          const nextModule = await Module.findOne({ 
            order: { $gt: module.order },
            isActive: true 
          }).sort({ order: 1 });
          
          if (nextModule) {
            // Check if approval already exists
            let approval = await ModuleApproval.findOne({
              user: studentId,
              module: nextModule._id
            });
            
            if (!approval) {
              // Auto-approve next module
              approval = await ModuleApproval.create({
                user: studentId,
                module: nextModule._id,
                status: 'approved',
                approvedBy: req.user._id,
                approvedAt: Date.now(),
                triggeredBy: 'project_validation',
                relatedProject: project._id,
                comment: `Débloqué automatiquement après validation du projet "${project.name}"`
              });
              
              // Notify student
              await createNotification({
                userId: studentId,
                type: NOTIFICATION_TYPES.MODULE_APPROVED,
                title: 'Module débloqué',
                message: `Le module "${nextModule.title}" a été débloqué automatiquement après validation de votre projet`,
                relatedEntity: { entityType: 'module', entityId: nextModule._id }
              });
            } else if (approval.status === 'pending') {
              // Auto-approve pending request
              approval.status = 'approved';
              approval.approvedBy = req.user._id;
              approval.approvedAt = Date.now();
              approval.triggeredBy = 'project_validation';
              approval.relatedProject = project._id;
              approval.comment = `Débloqué automatiquement après validation du projet "${project.name}"`;
              await approval.save();
              
              // Notify student
              await createNotification({
                userId: studentId,
                type: NOTIFICATION_TYPES.MODULE_APPROVED,
                title: 'Module débloqué',
                message: `Le module "${nextModule.title}" a été débloqué automatiquement après validation de votre projet`,
                relatedEntity: { entityType: 'module', entityId: nextModule._id }
              });
            }
          }
        } else {
          // If autoUnlockOnProjectValidation is false, create approval request instead
          const nextModule = await Module.findOne({ 
            order: { $gt: module.order },
            isActive: true 
          }).sort({ order: 1 });
          
          if (nextModule) {
            const existingApproval = await ModuleApproval.findOne({
              user: studentId,
              module: nextModule._id
            });
            
            if (!existingApproval) {
              await ModuleApproval.create({
                user: studentId,
                module: nextModule._id,
                status: 'pending',
                triggeredBy: 'project_validation',
                relatedProject: project._id,
                comment: `Demande automatique après validation du projet "${project.name}"`
              });
              
              // Notify teacher/admin
              const User = require('../models/User');
              const Group = require('../models/Group');
              const student = await User.findById(studentId);
              
              if (student.groupId) {
                const group = await Group.findById(student.groupId).populate('teacher');
                if (group.teacher) {
                  await createNotification({
                    userId: group.teacher._id,
                    type: NOTIFICATION_TYPES.MODULE_APPROVAL_REQUESTED,
                    title: 'Demande d\'approbation automatique',
                    message: `${student.name} a validé le projet "${project.name}" et demande l'approbation pour le module "${nextModule.title}"`,
                    relatedEntity: { entityType: 'module', entityId: nextModule._id }
                  });
                }
              }
            }
          }
        }
      }
    }

    await submission.populate('student', 'name email');
    await submission.populate('gradedBy', 'name email');

    res.json(submission);
  } catch (error) {
    console.error('Error grading project:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private/Teacher/Admin
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, status, deliverables, dueDate, instructions } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (deliverables) project.deliverables = deliverables;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (instructions !== undefined) project.instructions = instructions;

    await project.save();

    await project.populate('module', 'title');
    await project.populate('group', 'name');
    await project.populate('students', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
const deleteProject = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete projects' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all submissions
    await ProjectSubmission.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  submitProject,
  gradeProject,
  updateProject,
  deleteProject
};

