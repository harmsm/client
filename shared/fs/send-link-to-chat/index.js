// @flow
import * as React from 'react'
import * as Flow from '../../util/flow'
import * as ChatTypes from '../../constants/types/chat2'
import * as Kb from '../../common-adapters'
import * as Styles from '../../styles'

type Person = {|
  type: 'person',
  name: string,
|}

type Group = {|
  type: 'group',
  name: string,
|}

type SmallTeam = {|
  type: 'small-team',
  name: string,
|}

type Channel = {|convID: ChatTypes.ConversationIDKey, channelname: string|}

type BigTeam = {|
  type: 'big-team',
  name: string,
  channels: Array<Channel>,
  selectChannel: (convID: ChatTypes.ConversationIDKey) => void,
  selectedChannel?: ?Channel,
|}

type None = {|
  type: 'none',
|}

type Props = {|
  onCancel: () => void,
  conversation: Person | Group | SmallTeam | BigTeam | None,
  pathTextToCopy: string,
  send?: ?() => void,
|}

const who = (props: Props) => {
  switch (props.conversation.type) {
    case 'person':
      return props.conversation.name
    case 'group':
      return 'your group'
    case 'small-team':
      return 'team members'
    case 'big-team':
      return 'team members'
    case 'none':
      return ''
    default:
      Flow.ifFlowComplainsAboutThisFunctionYouHaventHandledAllCasesInASwitch(props.conversation.type)
      return 'this should not happen'
  }
}

class BigTeamChannelDropdownMobile extends React.PureComponent<BigTeam, {visible: boolean}> {
  state = {visible: false}
  _show = () => this.setState({visible: true})
  _hide = () => this.setState({visible: false})
  _select = convIDStr => {
    this.props.selectChannel(ChatTypes.stringToConversationIDKey(convIDStr))
  }
  render() {
    return (
      <>
        <Kb.ClickableBox onClick={this._show} style={styles.dropdown}>
          <Kb.Box2 direction="horizontal" gap="small" fullWidth={true}>
            <Kb.Text type="BodyBig" style={styles.dropdownTextMobile} lineClamp={1}>
              {this.props.selectedChannel ? `#${this.props.selectedChannel.channelname}` : 'Pick a channel'}
            </Kb.Text>
            <Kb.Icon
              type="iconfont-caret-down"
              inheritColor={true}
              fontSize={12}
              style={styles.dropdownIconMobile}
            />
          </Kb.Box2>
        </Kb.ClickableBox>
        <Kb.FloatingPicker
          items={this.props.channels.map(({convID, channelname}) => ({
            label: `#${channelname}`,
            value: ChatTypes.conversationIDKeyToString(convID),
          }))}
          visible={this.state.visible}
          selectedValue={
            this.props.selectedChannel &&
            ChatTypes.conversationIDKeyToString(this.props.selectedChannel.convID)
          }
          promptString="Pick a channel"
          prompt={
            <Kb.Box2 direction="horizontal" fullWidth={true} gap="xtiny" centerChildren={true}>
              <Kb.Text type="BodySmallSemibold">Pick a channel</Kb.Text>
            </Kb.Box2>
          }
          onCancel={this._hide}
          onHidden={this._hide}
          onDone={this._hide}
          onSelect={this._select}
        />
      </>
    )
  }
}

const BigTeamChannelDropdownDesktop = (conversation: BigTeam) => (
  <Kb.Dropdown
    style={styles.dropdown}
    items={conversation.channels.map(({convID, channelname}) => (
      <Kb.Box2
        direction="horizontal"
        centerChildren={true}
        fullWidth={true}
        key={ChatTypes.conversationIDKeyToString(convID)}
      >
        <Kb.Box style={styles.dropdownBoxDesktop}>
          <Kb.Text type="Body">#{channelname}</Kb.Text>
        </Kb.Box>
      </Kb.Box2>
    ))}
    selected={
      conversation.selectedChannel ? (
        <Kb.Box style={styles.dropdownBoxDesktop}>
          <Kb.Text type="BodyBig">#{conversation.selectedChannel.channelname}</Kb.Text>
        </Kb.Box>
      ) : (
        <Kb.Text type="BodyBig" key="placeholder-select">
          Pick a channel
        </Kb.Text>
      )
    }
    onChanged={(node: React.Node) => {
      if (React.isValidElement(node)) {
        // $FlowIssue React.isValidElement refinement doesn't happen, see https://github.com/facebook/flow/issues/6392
        const element = (node: React.Element<any>)
        // $FlowIssue flow doesn't know key is string
        conversation.selectChannel(ChatTypes.stringToConversationIDKey(element.key))
      }
    }}
  />
)

const BigTeamChannelDropdown = Styles.isMobile ? BigTeamChannelDropdownMobile : BigTeamChannelDropdownDesktop

const HeaderContent = (props: Props) =>
  props.conversation.type === 'none' ? (
    <Kb.Text type={Styles.isMobile ? 'BodySemibold' : 'Header'}>Copy link</Kb.Text>
  ) : (
    <Kb.Text type={Styles.isMobile ? 'BodySemibold' : 'Header'}>
      Send link to{' '}
      {props.conversation.type === 'small-team' || props.conversation.type === 'big-team'
        ? 'team chat'
        : 'group chat'}
    </Kb.Text>
  )

const DesktopHeader = (props: Props) => (
  <Kb.Box2 direction="horizontal" centerChildren={true} style={styles.desktopHeader} fullWidth={true}>
    <HeaderContent {...props} />
  </Kb.Box2>
)

const Footer = (props: Props) => (
  <Kb.Box2 direction="horizontal" centerChildren={true} style={styles.footer} gap="tiny">
    {!Styles.isMobile && <Kb.Button type="Secondary" label="Cancel" onClick={props.onCancel} />}
    {props.conversation.type !== 'none' && (
      <Kb.Button type="Primary" label="Send in conversation" disabled={!props.send} onClick={props.send} />
    )}
  </Kb.Box2>
)

const SendLinkToChatMain = (props: Props) => (
  <Kb.Box2 direction="vertical" fullWidth={true} centerChildren={true} style={styles.main}>
    <Kb.Box2 direction="horizontal" fullWidth={true} centerChildren={true} style={styles.centerBox}>
      <Kb.CopyText text={props.pathTextToCopy} multiline={Styles.isMobile} />
    </Kb.Box2>
    {props.conversation.type !== 'none' && (
      <Kb.Text type="BodySmall" style={styles.onlyWhoGetAccess}>
        Only {who(props)} will get access to the file.
      </Kb.Text>
    )}
    <Kb.Box2 direction="horizontal" fullWidth={true} centerChildren={true} style={styles.centerBox}>
      {props.conversation.type === 'big-team' && <BigTeamChannelDropdown {...props.conversation} />}
    </Kb.Box2>
  </Kb.Box2>
)

const DesktopSendLinkToChat = (props: Props) => (
  <Kb.Box2 direction="vertical" style={styles.desktopContainer}>
    <DesktopHeader {...props} />
    <SendLinkToChatMain {...props} />
    <Footer {...props} />
  </Kb.Box2>
)

const MobileHeader = (props: Props) => (
  <Kb.Box2 direction="horizontal" centerChildren={true} fullWidth={true} style={styles.mobileHeader}>
    <Kb.Box2 direction="horizontal" style={styles.mobileHeaderContent} fullWidth={true} centerChildren={true}>
      <HeaderContent {...props} />
    </Kb.Box2>
    <Kb.Text type="BodyBigLink" style={styles.mobileButton} onClick={props.onCancel}>
      Cancel
    </Kb.Text>
  </Kb.Box2>
)

const MobileSendLinkToChat = (props: Props) => (
  <Kb.Box2 direction="vertical" fullHeight={true} fullWidth={true}>
    <SendLinkToChatMain {...props} />
    <Footer {...props} />
  </Kb.Box2>
)

const MobileWithHeader = Kb.HeaderHoc(MobileSendLinkToChat)

export default (Styles.isMobile
  ? (props: Props) => (
      // $FlowIssue seems HeaderHoc typing is wrong
      <MobileWithHeader customComponent={<MobileHeader {...props} />} {...props} />
    )
  : Kb.HeaderOrPopup(DesktopSendLinkToChat))

const styles = Styles.styleSheetCreate({
  avatar: {
    marginRight: Styles.globalMargins.xtiny,
  },
  centerBox: {
    paddingLeft: Styles.globalMargins.medium,
    paddingRight: Styles.globalMargins.medium,
  },
  desktopContainer: {
    height: 480,
    width: 560,
  },
  desktopHeader: {
    flexWrap: 'wrap',
    paddingLeft: Styles.globalMargins.mediumLarge,
    paddingRight: Styles.globalMargins.mediumLarge,
    paddingTop: Styles.globalMargins.mediumLarge,
  },
  dropdown: Styles.platformStyles({
    common: {
      marginTop: Styles.globalMargins.mediumLarge,
    },
    isMobile: {
      borderColor: Styles.globalColors.black_10,
      borderRadius: Styles.borderRadius,
      borderStyle: 'solid',
      borderWidth: 1,
      padding: Styles.globalMargins.tiny,
      width: 240,
    },
  }),
  dropdownBoxDesktop: Styles.platformStyles({
    isElectron: {
      overflow: 'hidden',
      paddingLeft: Styles.globalMargins.tiny,
      paddingRight: Styles.globalMargins.tiny,
      textOverflow: 'ellipsis',
    },
  }),
  dropdownIconMobile: {
    marginTop: 4,
  },
  dropdownTextMobile: {
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    marginBottom: Styles.globalMargins.large,
  },
  main: {
    flex: 1,
  },
  mobileButton: {
    left: 0,
    paddingBottom: Styles.globalMargins.tiny,
    paddingLeft: Styles.globalMargins.small,
    paddingRight: Styles.globalMargins.small,
    paddingTop: Styles.globalMargins.tiny,
    position: 'absolute',
  },
  mobileHeader: {
    minHeight: 44,
  },
  mobileHeaderContent: {
    flex: 1,
    flexShrink: 1,
    padding: Styles.globalMargins.xtiny,
  },
  mobileHeaderText: {
    textAlign: 'center',
  },
  onlyWhoGetAccess: {
    marginTop: Styles.globalMargins.xsmall,
  },
})
