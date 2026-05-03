const User = require('../.models/User');
const { generateToken } = require('../middleware/auth');

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(401).json({ message: 'Account deactivated' });

    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name)   user.name   = name;
    if (phone)  user.phone  = phone;
    if (avatar) user.avatar = avatar;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };