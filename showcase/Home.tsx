import * as React from 'react';
import { style, media } from 'typestyle';
import { queries } from './index';

const Arrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="22" height="22" className={svgIcon}>
    <rect width="200" height="200" fill="red" opacity="0"></rect>
    <polygon points="170.71 88.69 115.41 33.39 104.1 44.7 151.4 92 29.29 92 29.29 108 151.4 108 104.1 155.3 115.41 166.61 170.71 111.31 182.02 100 170.71 88.69"></polygon>
  </svg>
)

export const SandboxTitle = style({
  color: '#ffffff',
  fontSize: 28,
  fontWeight: 'bold',
  paddingBottom: 20,
  marginBottom: 20,
  borderBottom: '1px solid #4d4d4d'
});

export const OptionTitle = style({
  alignSelf: 'stretch',
  display: 'flex',
  justifyContent: 'flex-start',
  padding: '30px 40px'
})

export const svgIcon = style({
  fill: '#ffffff',
  transition: '.35s ease-out',
  $nest: {
    '&:hover': {
      fill: '#22B38C',
    }
  }
})

export const SandboxPanel = style({
  backgroundColor: '#1A1919',
  width: '100%',
  height: '100%',
  padding: '40px 50px',
  display: 'flex',
  flexDirection: 'column'
});

export const SandboxExamples = style({
  display: 'grid',
  gridGap: 20,
  gridTemplateColumns: '1fr 1fr 1fr',
  gridTemplateRows: 'auto'
}, media({maxWidth: 1024}, {
  gridTemplateColumns: '1fr 1fr'
}), media({maxWidth: 640}, {
  gridTemplateColumns: '1fr'
}));

export const SandboxOption = style({
  backgroundColor: '#ffffff11',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  maxHeight: '100%',
  minHeight: 220
})

export const OptionDescription = style({
  fontSize: 12,
  lineHeight: '20px',
  padding: '10px 40px'
})

export const OptionArrow = style({
  marginTop: 'auto',
  justifyContent: 'flex-end',
  alignSelf: 'stretch',
  display: 'flex'
})

export const ArrowSign = style({
  padding: '0 15px 15px 0',
  display: 'flex',
  cursor: 'pointer',
  justifyContent: 'center'
})

export class Home extends React.Component {
  render() {
    return (
      <div className={SandboxPanel}>
        <div className={SandboxTitle}>Showcase</div>
        <div className={SandboxExamples}>
          <div className={SandboxOption}>
            <div className={OptionTitle}>Dark Mode</div>
            <div className={OptionDescription}>Open Diagram in default dark theme mode.<div>Try to create Your own graph with defined nodes.</div></div>
            <div className={OptionArrow}>
              <a href={`/?option=${queries.darkTheme}`} className={ArrowSign}><Arrow /></a>
            </div>
          </div>
          <div className={SandboxOption}>
            <div className={OptionTitle}>Light Mode</div>
            <div className={OptionDescription}>Open Diagram in light theme mode.<div>Try to create Your own graph with defined nodes.</div></div>
            <div className={OptionArrow}>
              <a href={`/?option=${queries.lightTheme}`} className={ArrowSign}><Arrow /></a>
            </div>
          </div>
          <div className={SandboxOption}>
            <div className={OptionTitle}>Large number of nodes</div>
            <div className={OptionDescription}>Open Diagram with large number of nodes.<div>The graph is in read-only mode.</div></div>
            <div className={OptionArrow}>
              <a href={`/?option=${queries.largeNumberOfNodes}`} className={ArrowSign}><Arrow /></a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
