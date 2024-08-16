import { Router } from 'express';

const providersRouter = Router();

providersRouter.get('/providers', (req, res) => {
   res.json([
      'romsfun',
      'cdromance'
   ])
});

export default providersRouter;