import path from 'path';
import dotenv from 'dotenv';

const projectRootEnv = path.resolve(__dirname, '../../..', '.env');
const backendEnv = path.resolve(__dirname, '../..', '.env');

dotenv.config({ path: projectRootEnv });
dotenv.config({ path: backendEnv, override: true });

