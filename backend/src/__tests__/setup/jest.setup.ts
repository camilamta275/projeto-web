import { authService } from '../../services/authService';

afterEach(() => {
  authService.clearTokenBlocklist();
});
