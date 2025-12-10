const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (email: string, mobile: string, password: string, name?: string, username?: string) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, mobile, password, name, username }),
    });
  },

  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  loginWithApplicationId: async (applicationId: string, password: string) => {
    return apiCall('/auth/login/app-id', {
      method: 'POST',
      body: JSON.stringify({ applicationId, password }),
    });
  },

  getUser: async (userId: string) => {
    return apiCall(`/auth/user/${userId}`);
  },
};

// KYC API
export const kycAPI = {
  getApplication: async (userId: string) => {
    return apiCall(`/kyc/application/${userId}`);
  },

  updatePersonalDetails: async (userId: string, details: {
    fullName: string;
    dateOfBirth: string;
    address?: string;
    gender?: string;
  }) => {
    return apiCall(`/kyc/application/${userId}/personal-details`, {
      method: 'PUT',
      body: JSON.stringify(details),
    });
  },

  updateStep: async (userId: string, step: number) => {
    return apiCall(`/kyc/application/${userId}/step`, {
      method: 'PUT',
      body: JSON.stringify({ step }),
    });
  },

  submitForVerification: async (userId: string) => {
    return apiCall(`/kyc/application/${userId}/submit`, {
      method: 'POST',
    });
  },
};

// Upload API
export const uploadAPI = {
  uploadDocument: async (userId: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    // Convert file path to URL
    const fileUrl = data.filePath.startsWith('http') 
      ? data.filePath 
      : `${API_BASE_URL.replace('/api', '')}/${data.filePath.replace(/\\/g, '/')}`;
    
    return {
      ...data,
      previewUrl: fileUrl,
    };
  },

  uploadPhoto: async (userId: string, photoType: 'photo' | 'selfie', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('photoType', photoType);

    const response = await fetch(`${API_BASE_URL}/upload/photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    // Convert file path to URL
    const fileUrl = data.filePath.startsWith('http') 
      ? data.filePath 
      : `${API_BASE_URL.replace('/api', '')}/${data.filePath.replace(/\\/g, '/')}`;
    
    return {
      ...data,
      previewUrl: fileUrl,
    };
  },
};


