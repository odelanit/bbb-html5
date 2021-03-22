import React from 'react'
import {getContacts} from "./service";

class Invite extends React.Component {
    state = {
        keyword: ''
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.keyword !== this.state.keyword) {
            const data = await getContacts()
            console.log(data)
        }
    }

    render() {
        const {currentUser} = this.props
        console.log("currentUser: ", currentUser)

        return (
            <div className="p-4">
                <h3 className="mb-4" style={{fontSize: '24px'}}>Invite people</h3>
                <div className="field">
                    <div className="control has-icons-left">
                        <input className="input" type="text" value={this.state.keyword}
                               onChange={(event) => this.setState({keyword: event.target.value})}/>
                        <span className="icon is-small is-left"><i className="fa fa-search"/></span>
                        {
                            this.state.keyword && (
                                <span className="icon is-right is-small" onClick={() => this.setState({keyword: ''})}><i
                                    className="fa fa-times"/></span>
                            )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Invite
