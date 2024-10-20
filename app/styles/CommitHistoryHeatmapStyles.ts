import { CSSProperties } from 'react';

export const commitHistoryHeatmapStyles = {
  container: {
    marginTop: '0rem',
    overflowX: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as CSSProperties,

  heatmapWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '100%',
  } as CSSProperties,

  heatmapContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as CSSProperties,

  monthLabels: {
    display: 'flex',
    fontSize: '12px',
    color: '#767676',
    position: 'relative',
    marginBottom: '8px',
    height: '20px',
    width: '100%',
  } as CSSProperties,

  monthLabel: {
    position: 'absolute',
    top: 0,
  } as CSSProperties,

  heatmapGrid: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(7, 1fr)',
  } as CSSProperties,

  heatmapCell: {
    borderRadius: '3px',
  } as CSSProperties,

  title: {
    textAlign: 'center',
    marginBottom: '1rem',
  } as CSSProperties,
};
