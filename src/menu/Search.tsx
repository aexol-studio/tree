import * as React from 'react';
import * as styles from './style/Search';
import { NodeType } from '../types';
export type SearchState = {
  query: string;
  current: number;
  results: NodeType[];
};

export type SearchProps = {
  onSearch: (n: NodeType) => void;
  nodes: NodeType[];
};

export class Search extends React.Component<SearchProps, SearchState> {
  search: HTMLInputElement;
  state: SearchState = {
    query: '',
    results: [],
    current: 0
  };
  componentDidMount(){
      this.search.focus();
  }
  render() {
    const { nodes, onSearch } = this.props;
    return (
      <input
        className={styles.Search}
        ref={(ref) => {
          this.search = ref;
        }}
        type="text"
        value={this.state.query}
        onKeyDown={(e) => {
          if ((e.keyCode === 13 || e.key === 'Enter') && this.state.results.length > 0) {
            let current = (this.state.current + 1) % this.state.results.length;
            this.setState({
              current
            });
            onSearch(this.state.results[current]);
            this.search.focus();
          }
        }}
        onChange={({ target: { value: query } }) => {
          const results = nodes.filter(
            (n) => n.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
          );
          let current = (this.state.current + 1) % this.state.results.length;
          if (results.length !== this.state.results.length) {
            current = 0;
          }
          this.setState({
            query,
            results,
            current
          });
          onSearch(results[current]);
        }}
      />
    );
  }
}
