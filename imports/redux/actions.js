import {SET_INVITE_BOX, SET_CHAT_BOX, SET_PANEL_OPENED} from "./actionTypes";

export const setPanelOpened = payload => ({
    type: SET_PANEL_OPENED,
    payload: payload
})

export const setChatBox = payload => ({
    type: SET_CHAT_BOX,
    payload: payload
})

export const setInviteBox = payload => ({
    type: SET_INVITE_BOX,
    payload: payload
})
