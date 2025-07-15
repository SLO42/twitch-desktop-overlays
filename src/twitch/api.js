import { ApiClient } from '@twurple/api';

const apiClient = authProvider => new ApiClient({ authProvider });
export default apiClient;
