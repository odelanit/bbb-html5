import axios from "axios";

export const glDomain = 'http://127.0.0.1:5000'

export const getGuests = async (meetingId) => {
    const response = await axios.get(`${glDomain}/api/guests?meetingId=${meetingId}`)
    return response.data
}

export const getContacts = async (uid, keyword) => {
    const response = await axios.get(`${glDomain}/api/contacts?uid=${uid}&keyword=${keyword}`)
    return response.data
}
