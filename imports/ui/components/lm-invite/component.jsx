import React from 'react'
import {getContacts} from "./service";
import {connect} from "react-redux";
import {setPanelOpened} from "/imports/redux/actions";

class Invite extends React.Component {
    state = {
        keyword: ''
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.keyword !== this.state.keyword) {
            const data = await getContacts(this.props.currentUser.extId, this.state.keyword)
            console.log(data)
        }
    }

    handleClose = () => {
        this.props.setPanelOpened(false)
    }

    render() {
        return (
            <div className="p-4">
                <div className="is-flex is-align-items-center">
                    <h3 className="mb-4" style={{fontSize: '24px'}}>Invite people</h3>
                    <div>
                        <span onClick={this.handleClose}><i className="fa fa-times" /></span>
                    </div>
                </div>
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

export default connect(null, {
    setPanelOpened,
})(Invite)
