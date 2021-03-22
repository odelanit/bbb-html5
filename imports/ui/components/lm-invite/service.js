import axios from "axios";

export const glDomain = 'http://13.126.52.183'

export const getGuests = async (meetingId) => {
    const response = await axios.get(`${glDomain}/api/guests?uid=${meetingId}`)
    return response.data
}

export const getContacts = async (uid, keyword) => {
    const response = await axios.get(`${glDomain}/api/contacts?uid=${uid}&keyword=${keyword}`)
    return response.data
}

export const inviteGuest = async (uid, contactId) => {
    const response = await axios.get(`${glDomain}/api/invite?uid=${uid}&contact_id=${contactId}`)
    return response.data
}