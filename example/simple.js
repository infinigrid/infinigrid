const { Viewport, View, Model } = require('../src');

const React = require('react');
const { render } = require('react-dom');

const div = document.createElement('div');
render((
  <Viewport model={new Model().randomizeMap(16).fitCellInViewport([0,0])}>
    <View/>
  </Viewport>
), div, () => document.body.appendChild(div));
