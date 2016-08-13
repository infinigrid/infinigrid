## Use image as map

```js
class ImageExample extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      model: new Model(),
    };

    this.image = new Image();
    this.image.src = 'world.jpg';
    this.image.onload = () => {
      this.setState({model: this.state.model.mapFromImage(2048, 2048, this.image) });
    };
  }

  render() {
    return (
      <Viewport model={this.state.model} onClickCell={ (q, r) => console.log(q,r) }>
        <View/>
      </Viewport>
    );
  }

}
```
