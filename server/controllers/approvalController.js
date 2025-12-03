const ModuleApproval = require('../models/ModuleApproval');
const Module = require('../models/Module');
const User = require('../models/User');
const { createNotification, NOTIFICATION_TYPES } = require('../services/notificationService');

/**
 * @desc    Request module approval
 * @route   POST /api/approvals/request/:moduleId
 * @access  Private/Student
 */
const requestApproval = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can request approval' });
    }

    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Check if module requires approval
    if (module.unlockMode !== 'approval' && !module.approvalRequired) {
      return res.status(400).json({ message: 'This module does not require approval' });
    }

    // Check if approval already exists
    const existingApproval = await ModuleApproval.findOne({
      user: req.user._id,
      module: moduleId
    });

    if (existingApproval) {
      if (existingApproval.status === 'pending') {
        return res.status(400).json({ message: 'Approval request already pending' });
      }
      if (existingApproval.status === 'approved') {
        return res.status(400).json({ message: 'Module already approved' });
      }
      // If rejected, allow new request
      existingApproval.status = 'pending';
      existingApproval.comment = null;
      existingApproval.approvedBy = null;
      existingApproval.approvedAt = null;
      existingApproval.requestedAt = Date.now();
      await existingApproval.save();
      return res.json(existingApproval);
    }

    const approval = await ModuleApproval.create({
      user: req.user._id,
      module: moduleId,
      status: 'pending'
    });

    // Notify teacher/admin
    const Group = require('../models/Group');
    const user = await User.findById(req.user._id);
    
    if (user.groupId) {
      const group = await Group.findById(user.groupId).populate('teacher');
      if (group.teacher) {
        await createNotification({
          userId: group.teacher._id,
          type: NOTIFICATION_TYPES.SYSTEM,
          title: 'Demande d\'approbation',
          message: `${req.user.name} demande l'approbation pour le module "${module.title}"`,
          relatedEntity: { entityType: 'module', entityId: moduleId }
        });
      }
    }

    // Also notify admin
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin =>
      createNotification({
        userId: admin._id,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Demande d\'approbation',
        message: `${req.user.name} demande l'approbation pour le module "${module.title}"`,
        relatedEntity: { entityType: 'module', entityId: moduleId }
      })
    ));

    await approval.populate('module', 'title');
    await approval.populate('user', 'name email');

    res.status(201).json(approval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get pending approvals
 * @route   GET /api/approvals/pending
 * @access  Private/Teacher/Admin
 */
const getPendingApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let query = { status: 'pending' };

    // If teacher, only show approvals for students in their groups
    if (req.user.role === 'teacher') {
      const Group = require('../models/Group');
      const groups = await Group.find({ teacher: req.user._id });
      const groupIds = groups.map(g => g._id);
      const students = await User.find({ groupId: { $in: groupIds } });
      const studentIds = students.map(s => s._id);
      query.user = { $in: studentIds };
    }

    const approvals = await ModuleApproval.find(query)
      .populate('user', 'name email avatar')
      .populate('module', 'title description')
      .sort({ requestedAt: -1 });

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my approval requests
 * @route   GET /api/approvals/my
 * @access  Private/Student
 */
const getMyApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their approvals' });
    }

    const approvals = await ModuleApproval.find({ user: req.user._id })
      .populate('module', 'title description')
      .populate('approvedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve module access
 * @route   POST /api/approvals/:id/approve
 * @access  Private/Teacher/Admin
 */
const approveModule = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { comment } = req.body;
    const approval = await ModuleApproval.findById(req.params.id)
      .populate('user', 'name email')
      .populate('module', 'title');

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval is not pending' });
    }

    // Check if teacher can approve (must be teacher of student's group)
    if (req.user.role === 'teacher') {
      const Group = require('../models/Group');
      const user = await User.findById(approval.user._id);
      if (user.groupId) {
        const group = await Group.findById(user.groupId);
        if (group.teacher?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You can only approve for students in your groups' });
        }
      } else {
        return res.status(403).json({ message: 'Student is not in any group' });
      }
    }

    approval.status = 'approved';
    approval.approvedBy = req.user._id;
    approval.comment = comment || null;
    approval.approvedAt = Date.now();
    await approval.save();

    // Notify student
    await createNotification({
      userId: approval.user._id,
      type: NOTIFICATION_TYPES.MODULE_ASSIGNED,
      title: 'Module approuvé',
      message: `Votre demande d'accès au module "${approval.module.title}" a été approuvée`,
      relatedEntity: { entityType: 'module', entityId: approval.module._id }
    });

    res.json(approval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject module access
 * @route   POST /api/approvals/:id/reject
 * @access  Private/Teacher/Admin
 */
const rejectModule = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { comment } = req.body;
    const approval = await ModuleApproval.findById(req.params.id)
      .populate('user', 'name email')
      .populate('module', 'title');

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval is not pending' });
    }

    // Check if teacher can reject (must be teacher of student's group)
    if (req.user.role === 'teacher') {
      const Group = require('../models/Group');
      const user = await User.findById(approval.user._id);
      if (user.groupId) {
        const group = await Group.findById(user.groupId);
        if (group.teacher?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You can only reject for students in your groups' });
        }
      } else {
        return res.status(403).json({ message: 'Student is not in any group' });
      }
    }

    approval.status = 'rejected';
    approval.approvedBy = req.user._id;
    approval.comment = comment || null;
    approval.approvedAt = Date.now();
    await approval.save();

    // Notify student
    await createNotification({
      userId: approval.user._id,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'Demande d\'approbation rejetée',
      message: `Votre demande d'accès au module "${approval.module.title}" a été rejetée${comment ? `: ${comment}` : ''}`,
      relatedEntity: { entityType: 'module', entityId: approval.module._id }
    });

    res.json(approval);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestApproval,
  getPendingApprovals,
  getMyApprovals,
  approveModule,
  rejectModule
};

