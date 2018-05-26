import * as React from 'react';

export type EditableTextProps = {
  text: string;
  onChange: (e) => void;
};
export type EditableTextState = {
  editing: boolean;
};
export class EditableText extends React.Component<EditableTextProps, EditableTextState> {
  state = {
    editing: false
  };
  render() {
    const { onChange, text } = this.props;
    const { editing } = this.state;
    return (
      <div
        onClick={() => {
          this.setState({
            editing: !editing
          });
        }}
      >
        {' '}
        {editing ? <input type="text" value={text} onChange={onChange} /> : text}{' '}
      </div>
    );
  }
}
