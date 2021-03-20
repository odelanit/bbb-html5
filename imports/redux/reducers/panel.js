import {SET_INVITE_BOX, SET_CHAT_BOX, SET_PANEL_OPENED} from "../actionTypes";

const initialState = {
    isPanelOpened: false,
    isChatBox: false,
    isInviteBox: false
}

const panel = (state = initialState, action) => {
    switch (action.type) {
        case SET_PANEL_OPENED:
            const isPanelOpened = action.payload;
            return {
                ...state,
                isPanelOpened,
            }
        case SET_CHAT_BOX:
            const isChatBox = action.payload;
            return {
                ...state,
                isChatBox
            }
        case SET_INVITE_BOX:
            const isInviteBox = action.payload
            return {
                ...state,
                isInviteBox,
            }
        default:
            return state
    }
}

export default panel
