import React from 'react';
import ReactDOM from 'react-dom';

export const createListItem = (index: number, title: string, artist: string): Node => {
  const reactDOM = (
    <div style={{ position: 'relative', marginTop: 8, padding: 4, border: '1px solid gray', borderRadius: 4, boxShadow: 'gray 1px 1px 1px 1px' }}>
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: -4,
          width: 20,
          height: 20,
          backgroundColor: 'rgba(255, 0, 0, .7)',
          borderRadius: '40%',
          color: 'white',
          fontSize: 12,
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: 2,
        }}
      >
        {index}
      </div>
      <div>
        <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', margin: 0, marginLeft: 4, padding: 0 }}>
          <span className="title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 24 }} title={title}>
            {title}
          </span>
          <small
            className="artist"
            style={{
              alignSelf: 'flex-end',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 30,
              color: 'gray',
              fontSize: 12,
              textAlign: 'right',
            }}
            title={artist}
          >
            {artist}
          </small>
        </h1>
      </div>
      <div className="video" style={{ display: 'none' }}>
        <hr />
        <iframe frameBorder={0} allowFullScreen={true}></iframe>
      </div>
    </div>
  );
  return ReactDOM.render(reactDOM, document.createElement('div'));
};
