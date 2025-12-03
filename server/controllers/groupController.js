const Group = require('../models/Group');
const User = require('../models/User');
const Module = require('../models/Module');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private/Admin/Teacher
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, teacherId, studentIds, moduleIds } = req.body;

    // Verify teacher exists if provided
    if (teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }
    }

    // Verify students exist
    if (studentIds && studentIds.length > 0) {
      const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
      if (students.length !== studentIds.length) {
        return res.status(400).json({ message: 'Some student IDs are invalid' });
      }
      
      // Check if students are already in a group
      const studentsInGroups = await User.find({ 
        _id: { $in: studentIds }, 
        groupId: { $ne: null } 
      });
      if (studentsInGroups.length > 0) {
        return res.status(400).json({ 
          message: 'Some students are already in a group',
          students: studentsInGroups.map(s => s._id)
        });
      }
    }

    // Verify modules exist
    if (moduleIds && moduleIds.length > 0) {
      const modules = await Module.find({ _id: { $in: moduleIds } });
      if (modules.length !== moduleIds.length) {
        return res.status(400).json({ message: 'Some module IDs are invalid' });
      }
    }

    const group = await Group.create({
      name,
      description,
      teacher: teacherId || null,
      students: studentIds || [],
      modules: moduleIds || []
    });

    // Update students' groupId
    if (studentIds && studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: studentIds } },
        { $set: { groupId: group._id } }
      );

      // Notify students
      await Promise.all(studentIds.map(studentId => 
        createNotification({
          userId: studentId,
          type: NOTIFICATION_TYPES.GROUP_UPDATED,
          title: 'Vous avez été ajouté à un groupe',
          message: `Vous avez été ajouté au groupe "${name}"`,
          relatedEntity: { entityType: 'group', entityId: group._id }
        })
      ));
    }

    // Populate references
    await group.populate('teacher', 'name email');
    await group.populate('students', 'name email');
    await group.populate('modules', 'title description');

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all groups
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;
    let query = {};

    // Filter by teacher
    if (teacherId) {
      query.teacher = teacherId;
    }

    // Filter by student
    if (studentId) {
      query.students = studentId;
    }

    const groups = await Group.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email avatar')
      .populate('modules', 'title description')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my groups
 * @route   GET /api/groups/my
 * @access  Private
 */
const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let groups = [];

    if (userRole === 'student') {
      // Get group where student is member
      groups = await Group.find({ students: userId })
        .populate('teacher', 'name email avatar')
        .populate('students', 'name email avatar')
        .populate('modules', 'title description');
    } else if (userRole === 'teacher') {
      // Get groups where teacher is assigned
      groups = await Group.find({ teacher: userId })
        .populate('teacher', 'name email avatar')
        .populate('students', 'name email avatar')
        .populate('modules', 'title description');
    } else if (userRole === 'admin') {
      // Admin sees all groups
      groups = await Group.find()
        .populate('teacher', 'name email avatar')
        .populate('students', 'name email avatar')
        .populate('modules', 'title description');
    }

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar')
      .populate('modules', 'title description');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private/Admin/Teacher
 */
const updateGroup = async (req, res) => {
  try {
    const { name, description, teacherId, moduleIds } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'teacher' || group.teacher?.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    if (teacherId !== undefined) {
      if (teacherId) {
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
          return res.status(400).json({ message: 'Invalid teacher ID' });
        }
      }
      group.teacher = teacherId || null;
    }

    if (moduleIds) {
      const modules = await Module.find({ _id: { $in: moduleIds } });
      if (modules.length !== moduleIds.length) {
        return res.status(400).json({ message: 'Some module IDs are invalid' });
      }
      group.modules = moduleIds;

      // Notify students about new modules
      if (group.students.length > 0) {
        await Promise.all(group.students.map(studentId =>
          createNotification({
            userId: studentId,
            type: NOTIFICATION_TYPES.MODULE_ASSIGNED,
            title: 'Nouveaux modules assignés',
            message: `De nouveaux modules ont été assignés à votre groupe "${group.name}"`,
            relatedEntity: { entityType: 'group', entityId: group._id }
          })
        ));
      }
    }

    await group.save();
    await group.populate('teacher', 'name email avatar');
    await group.populate('students', 'name email avatar');
    await group.populate('modules', 'title description');

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add students to group
 * @route   POST /api/groups/:id/students
 * @access  Private/Admin/Teacher
 */
const addStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'teacher' || group.teacher?.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify students exist and are not in another group
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Some student IDs are invalid' });
    }

    const studentsInGroups = await User.find({ 
      _id: { $in: studentIds }, 
      groupId: { $ne: null, $ne: group._id } 
    });
    if (studentsInGroups.length > 0) {
      return res.status(400).json({ 
        message: 'Some students are already in another group',
        students: studentsInGroups.map(s => s._id)
      });
    }

    // Add students to group
    const newStudentIds = studentIds.filter(id => !group.students.includes(id));
    group.students.push(...newStudentIds);
    await group.save();

    // Update students' groupId
    await User.updateMany(
      { _id: { $in: newStudentIds } },
      { $set: { groupId: group._id } }
    );

    // Notify students
    await Promise.all(newStudentIds.map(studentId =>
      createNotification({
        userId: studentId,
        type: NOTIFICATION_TYPES.GROUP_UPDATED,
        title: 'Vous avez été ajouté à un groupe',
        message: `Vous avez été ajouté au groupe "${group.name}"`,
        relatedEntity: { entityType: 'group', entityId: group._id }
      })
    ));

    await group.populate('students', 'name email avatar');
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Remove student from group
 * @route   DELETE /api/groups/:id/students/:studentId
 * @access  Private/Admin/Teacher
 */
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'teacher' || group.teacher?.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    group.students = group.students.filter(s => s.toString() !== studentId);
    await group.save();

    // Update student's groupId
    await User.findByIdAndUpdate(studentId, { $set: { groupId: null } });

    // Notify student
    await createNotification({
      userId: studentId,
      type: NOTIFICATION_TYPES.GROUP_UPDATED,
      title: 'Vous avez été retiré d\'un groupe',
      message: `Vous avez été retiré du groupe "${group.name}"`,
      relatedEntity: { entityType: 'group', entityId: group._id }
    });

    await group.populate('students', 'name email avatar');
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Assign modules to group
 * @route   POST /api/groups/:id/modules
 * @access  Private/Admin/Teacher
 */
const assignModules = async (req, res) => {
  try {
    const { moduleIds } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        (req.user.role !== 'teacher' || group.teacher?.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Verify modules exist
    const modules = await Module.find({ _id: { $in: moduleIds } });
    if (modules.length !== moduleIds.length) {
      return res.status(400).json({ message: 'Some module IDs are invalid' });
    }

    group.modules = moduleIds;
    await group.save();

    // Notify students
    if (group.students.length > 0) {
      await Promise.all(group.students.map(studentId =>
        createNotification({
          userId: studentId,
          type: NOTIFICATION_TYPES.MODULE_ASSIGNED,
          title: 'Nouveaux modules assignés',
          message: `De nouveaux modules ont été assignés à votre groupe "${group.name}"`,
          relatedEntity: { entityType: 'group', entityId: group._id }
        })
      ));
    }

    await group.populate('modules', 'title description');
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private/Admin
 */
const deleteGroup = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete groups' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Remove groupId from students
    if (group.students.length > 0) {
      await User.updateMany(
        { _id: { $in: group.students } },
        { $set: { groupId: null } }
      );

      // Notify students
      await Promise.all(group.students.map(studentId =>
        createNotification({
          userId: studentId,
          type: NOTIFICATION_TYPES.GROUP_UPDATED,
          title: 'Groupe supprimé',
          message: `Le groupe "${group.name}" a été supprimé`,
          relatedEntity: { entityType: 'group', entityId: group._id }
        })
      ));
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  updateGroup,
  addStudents,
  removeStudent,
  assignModules,
  deleteGroup
};

