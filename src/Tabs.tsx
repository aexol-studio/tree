import * as React from 'react';
import * as styles from './style/Tabs';
import * as cx from 'classnames';
import { TabsProps, TabsState, MAIN_TAB_NAME } from './types';
export class Tabs extends React.Component<TabsProps, TabsState> {
  state: TabsState = {};
  saveEditedTab = (tab) => {
    const { renameTab, removeTab } = this.props;
    const { renamed, renamedString = '' } = this.state;
    if (renamedString === MAIN_TAB_NAME) {
      this.setState({
        renamedString: '',
        renamed: null
      });
      if (renamed === '') {
        removeTab(tab);
      }
      return;
    }
    if (renamedString.length === 0) {
      removeTab(tab);
      return;
    }
    renameTab(tab, renamedString);
    this.setState({
      renamedString: '',
      renamed: null
    });
  };
  render() {
    const { tab, tabs, onSelect, addTab } = this.props;
    const { renamed, renamedString = '' } = this.state;
    const [mainTab, ...restTabs] = tabs;
    return (
      <div className={styles.Tabs}>
        <div className={styles.StaticTab}>Tabs:</div>
        <div
          className={cx({
            [styles.Tab]: true,
            [styles.ActiveTab]: mainTab === tab
          })}
          onClick={() => {
            onSelect(mainTab);
            this.setState({
              renamed:null,
              renamedString:''
            })
          }}
        >
          {mainTab}
        </div>
        {restTabs.map((t) => (
          <div
            key={t}
            className={cx({
              [styles.Tab]: true,
              [styles.ActiveTab]: t === tab
            })}
            onDoubleClick={(e) => {
              this.setState({
                renamed: t,
                renamedString: t
              });
            }}
            onClick={() => {
              onSelect(t);
            }}
          >
            {t === renamed ? (
              <input
                type="text"
                className={styles.RenameTabInput}
                value={renamedString}
                ref={(ref) => ref && ref.focus()}
                onChange={(e) => {
                  let name = e.target.value;
                  let pattern = new RegExp(/^[a-zA-Z]*$/);
                  if (!name.match(pattern)) {
                    return;
                  }
                  this.setState({
                    renamedString: name
                  });
                }}
                onKeyDown={(e) => {
                  if (e.keyCode === 13 || e.key === 'Enter') {
                    this.saveEditedTab(t);
                  }
                }}
                onBlur={(e) => {
                  this.saveEditedTab(t);
                }}
              />
            ) : (
              `${t}`
            )}
          </div>
        ))}
        <div
          className={cx({
            [styles.Tab]: true
          })}
          onClick={() => {
            const tabName = '';
            addTab(tabName);
            this.setState({
              renamed: tabName
            });
          }}
        >
          +
        </div>
      </div>
    );
  }
}
