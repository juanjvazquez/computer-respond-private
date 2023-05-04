const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const postChatGPT = async (formData) => {
    const response = await fetch(`${apiUrl}/api/chatgpt`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};
  
const postWhisper = async (formData) => {
    console.log("Api url beign accessed: ", apiUrl)
    const response = await fetch(`${apiUrl}/api/whisper`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

const postAWSPolly = async (formData) => {
    const response = await fetch(`${apiUrl}/api/aws-polly`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};
  
export { postChatGPT, postWhisper, postAWSPolly};