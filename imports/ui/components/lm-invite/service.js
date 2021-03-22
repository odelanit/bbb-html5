import axios from "axios";

const glDomain = 'http://127.0.0.1:5000'

export const getGuests = async (uid, meetingId) => {
    const response = await axios.get(`${glDomain}/api/guests?uid=${uid}&meetingId=${meetingId}`)
    return response.data
}

export const getContacts = async (uid) => {
    const response = await axios.get(`${glDomain}/api/contact?uid=${uid}`)
    return response.data
}
