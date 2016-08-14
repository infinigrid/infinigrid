const { Viewport, View, Model } = require('infinigrid');

const React = require('react');
const { render } = require('react-dom');

const model = new Model().randomizeMap(16).fitCellInViewport([0,0]);

render((
  <Viewport model={model}>
    <View/>
  </Viewport>
), document.getElementById('contents'));
