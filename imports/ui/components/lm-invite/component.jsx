import React from 'react'

class Invite extends React.Component {
  render() {
    return (
      <div className="p-4">
        <h3 className="mb-4" style={{fontSize: '24px'}}>Invite people</h3>
        <div className="field">
          <div className="control has-icons-left">
            <input className="input" type="text"/>
            <span className="icon is-small is-left">
              <i className="fa fa-search" />
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default Invite
