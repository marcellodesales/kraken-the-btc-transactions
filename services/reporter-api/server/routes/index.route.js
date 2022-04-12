import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /healthcheck - Check service health */
router.get('/healthcheck', (req, res) => res.send('OK'));

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

export default router;
