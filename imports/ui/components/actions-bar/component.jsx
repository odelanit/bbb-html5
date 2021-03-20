import React, {PureComponent} from 'react';
import cx from 'classnames';
import {connect} from 'react-redux';
import {styles} from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import QuickPollDropdown from './quick-poll-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import PresentationOptionsContainer from './presentation-options/component';
import {setChatBox, setInviteBox, setPanelOpened} from "/imports/redux/actions";

class ActionsBar extends PureComponent {
    handleMessageClicked = () => {
        const isPanelOpened = this.props.isPanelOpened;
        this.props.setPanelOpened(!isPanelOpened)
        this.props.setChatBox(true)
        this.props.setInviteBox(false)
    }

    render() {
        const {
            amIPresenter,
            handleShareScreen,
            handleUnshareScreen,
            isVideoBroadcasting,
            amIModerator,
            screenSharingCheck,
            enableVideo,
            isLayoutSwapped,
            toggleSwapLayout,
            handleTakePresenter,
            intl,
            currentSlidHasContent,
            parseCurrentSlideContent,
            isSharingVideo,
            screenShareEndAlert,
            stopExternalVideoShare,
            screenshareDataSavingSetting,
            isCaptionsAvailable,
            isMeteorConnected,
            isPollingEnabled,
            isThereCurrentPresentation,
            allowExternalVideo,
        } = this.props;

        const actionBarClasses = {};

        actionBarClasses[styles.centerWithActions] = amIPresenter;
        actionBarClasses[styles.center] = true;
        actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

        return (
            <>
                <AudioControlsContainer/>
                {enableVideo
                    ? (
                        <JoinVideoOptionsContainer/>
                    )
                    : null}
                <DesktopShare {...{
                    handleShareScreen,
                    handleUnshareScreen,
                    isVideoBroadcasting,
                    amIPresenter,
                    screenSharingCheck,
                    screenShareEndAlert,
                    isMeteorConnected,
                    screenshareDataSavingSetting,
                }}
                />
                <figure className="image is-44x44">
                    <img src="img/Hand.png" alt=""/>
                </figure>
                <figure className="image is-44x44" onClick={this.handleMessageClicked}>
                    <img src="img/MessageIcon.png"/>
                </figure>
                <ActionsDropdown {...{
                    amIPresenter,
                    amIModerator,
                    isPollingEnabled,
                    allowExternalVideo,
                    handleTakePresenter,
                    intl,
                    isSharingVideo,
                    stopExternalVideoShare,
                    isMeteorConnected,
                }}
                />
                <figure className="image is-44x44 call-end">
                    <img src="img/CallHang.png"/>
                </figure>
            </>
        )

        // return (
        //     <div className={styles.actionsbar}>
        //         <div className={styles.left}>
        //             <ActionsDropdown {...{
        //                 amIPresenter,
        //                 amIModerator,
        //                 isPollingEnabled,
        //                 allowExternalVideo,
        //                 handleTakePresenter,
        //                 intl,
        //                 isSharingVideo,
        //                 stopExternalVideoShare,
        //                 isMeteorConnected,
        //             }}
        //             />
        //             {isPollingEnabled
        //                 ? (
        //                     <QuickPollDropdown
        //                         {...{
        //                             currentSlidHasContent,
        //                             intl,
        //                             amIPresenter,
        //                             parseCurrentSlideContent,
        //                         }}
        //                     />
        //                 ) : null
        //             }
        //             {isCaptionsAvailable
        //                 ? (
        //                     <CaptionsButtonContainer {...{intl}} />
        //                 )
        //                 : null
        //             }
        //         </div>
        //         <div className={cx(actionBarClasses)}>
        //             <AudioControlsContainer/>
        //             {enableVideo
        //                 ? (
        //                     <JoinVideoOptionsContainer/>
        //                 )
        //                 : null}
        //             <DesktopShare {...{
        //                 handleShareScreen,
        //                 handleUnshareScreen,
        //                 isVideoBroadcasting,
        //                 amIPresenter,
        //                 screenSharingCheck,
        //                 screenShareEndAlert,
        //                 isMeteorConnected,
        //                 screenshareDataSavingSetting,
        //             }}
        //             />
        //         </div>
        //         <div className={styles.right}>
        //             {isLayoutSwapped
        //                 ? (
        //                     <PresentationOptionsContainer
        //                         toggleSwapLayout={toggleSwapLayout}
        //                         isThereCurrentPresentation={isThereCurrentPresentation}
        //                     />
        //                 )
        //                 : null
        //             }
        //         </div>
        //     </div>
        // );
    }
}

const mapStateToProps = state => {
    return {
        isPanelOpened: state.panel.isPanelOpened,
        isChatBox: state.panel.isChatBox,
        isInviteBox: state.panel.isInviteBox
    }
}

export default connect(mapStateToProps, {setPanelOpened, setChatBox, setInviteBox})(ActionsBar);
