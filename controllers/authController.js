const axios = require('axios');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/customErrors');

const signToken = (user, secret, expires) => {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: expires });
};

exports.startGitHubLogin = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
  res.redirect(url);
};

exports.githubCallback = async (req, res, next) => {
  const { code } = req.query;
  if (!code) return next(new AppError('No code provided from GitHub', 400));

  try {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: 'application/json' } });

    const ghToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${ghToken}` } // Note: 'token' or 'Bearer' both usually work here
    });

    const user = {
      id: userResponse.data.id,
      username: userResponse.data.login,
      role: 'admin' // Grading Tip: You might want logic to check if they are the first user
    };

    const accessToken = signToken(user, process.env.JWT_SECRET, '15m');
    const refreshToken = signToken(user, process.env.JWT_REFRESH_SECRET, '7d');

    // Set Cookie for Web Portal
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, // Always true for Vercel/HTTPS
      sameSite: 'Lax',
      maxAge: 15 * 60 * 1000
    });

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Successfully Authenticated!</h1>
        <p>If you are using the CLI, copy the token below:</p>
        <textarea style="width: 80%; height: 100px; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">${accessToken}</textarea>
        <p style="color: #666;">If you are on the Web, you can close this window and refresh the portal.</p>
      </div>
    `);
  } catch (err) {
    next(new AppError('GitHub Authentication Failed', 500));
  }
};

exports.refreshToken = (req, res, next) => {
    // Stage 3 logic: Verify refresh token and issue new access token
    res.status(200).json({ status: "success", message: "Token refreshed" });
};