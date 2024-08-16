import express, { type Request, type Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { providers } from './module/Providers'
import searchRouter from './router/SearchRouter';
import providersRouter from './router/ProvidersRouter';
import downloadRouter from './router/DownloadRouter';

const app = express();

// Use morgan to log requests
app.use(morgan('dev'));
app.use(cors());
app.set("providers", providers())

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", providersRouter);
app.use("/api", searchRouter);
app.use("/api/download", downloadRouter);

// Set the port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});