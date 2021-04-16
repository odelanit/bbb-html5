import React from 'react'
import {addContact, getContacts, getGuests, inviteGuest} from "./service";
import {connect} from "react-redux";
import {setPanelOpened} from "/imports/redux/actions";
import {styles} from './styles'

class Invite extends React.Component {
    state = {
        keyword: '',
        contacts: [],
    }

    async componentDidMount() {
        await this.getContacts()
    }

    getContacts = async () => {
        const contacts = await getContacts(this.props.currentUser.extId, this.state.keyword)
        const guests = await getGuests(this.props.meetingProp.extId)
        guests.forEach(guest => {
            let index = contacts.findIndex(c => c.id === guest.id)
            if (index > -1) {
                contacts[index]['invited'] = true
            }
        })
        this.setState({
            contacts,
        })
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.keyword !== this.state.keyword) {
            await this.getContacts()
        }
    }

    handleClose = () => {
        this.props.setPanelOpened(false)
    }

    toggleInvite = async (contact) => {
        if (contact.invited) {
            contact.invited = false
        } else {
            const data = await inviteGuest(this.props.meetingProp.extId, contact.id)
            contact.invited = data.invited
        }
        let index = this.state.contacts.findIndex(c => c.id === contact.id)
        let contacts = [...this.state.contacts]
        contacts[index] = contact
        this.setState({contacts})
    }

    handleKeyDown = async (event) => {
        const email = this.state.keyword
        if (event.keyCode === 13) {
            if (email) {
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (re.test(String(email).toLowerCase())) {
                    try {
                        await addContact(this.props.currentUser.extId, email)
                        await this.getContacts()
                    } catch (e) {
                        console.error(e)
                    }

                }
            }
        }
    }

    render() {
        return (
            <div className="p-4">
                <div className="is-flex is-align-items-center is-justify-content-space-between mb-4">
                    <h3 style={{fontSize: '24px'}}>Invite people</h3>
                    <div>
                        <span onClick={this.handleClose}><i className="fa fa-times"/></span>
                    </div>
                </div>
                <div className="field">
                    <div className="control has-icons-left">
                        <input
                            className="input" type="text"
                            value={this.state.keyword}
                            onChange={(event) => this.setState({keyword: event.target.value})}
                            onKeyDown={this.handleKeyDown}
                        />
                        <span className="icon is-small is-left"><i className="fa fa-search"/></span>
                        {
                            this.state.keyword && (
                                <span className="icon is-right is-small" onClick={() => this.setState({keyword: ''})}><i
                                    className="fa fa-times"/></span>
                            )
                        }
                    </div>
                </div>
                <div className="contact-list">
                    {this.state.contacts.map(contact => (
                        <div className={styles.contactItem} key={contact.id}>
                            <div className="media">
                                <div className="media-left">
                                    <figure className="image is-48x48">
                                        {contact.image ? (<img style={{borderRadius: '100%'}} src={contact.image}/>) : (<img
                                            src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"/>)}
                                        {/*<img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"/>*/}
                                    </figure>
                                </div>
                                <div className="media-content">
                                    <div className="content">
                                        <h5>{contact.first_name} {contact.last_name}</h5>
                                        <div className="columns">
                                            <div className="column is-two-thirds">
                                                {contact.email}
                                            </div>
                                            <div className="column">
                                                <label className="checkbox">
                                                    <input type="checkbox" checked={contact.invited} onChange={() => this.toggleInvite(contact)}/>
                                                    Invite
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default connect(null, {
    setPanelOpened,
})(Invite)
