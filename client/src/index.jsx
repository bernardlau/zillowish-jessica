var React = require('react');
var ReactDOM = require('react-dom');
 
function RenderMainPage(props) {
  return (
    <div className='mainPage'>
      <button onClick={props.onClick} className='arrow'> </button>
        <div className='mainPhoto'> <img id={0} onClick={props.imgClick} src={props.mainPhoto.img_url} alt='' width="500" height="405"/> </div>
        <div className='photos'> 
        {
          props.gallery.map((img, index) => {
            return <div key={index}> <img id={index + 1} onClick={props.imgClick} src={img.img_url} alt='' className='photoSize'/> </div>
          })
        } 
        </div>
        {/* creates template for when img is selected */}
        <div id='photoModal' className='photoModal'> 
          <div className='photoSelectGrid'>
            <button onClick={props.goBack} className='arrowBack'> </button> 
            <div className='photoContent'>
              <span onClick={props.closeModal} className="close">&times;</span>
              <div className='pictureOptions'>
                <div>
                  <button className='updatePhoto' onClick={props.updatePhoto}>Update</button>
                  <input type='text' className='updateTextbox' onChange={props.handleChange}/>
                </div>
                <button className='deletePhoto' onClick={props.deletePhoto}>Delete</button>
              </div>
              <img id='imgSelected' src='' alt='' width="800" height="700"/>
              {/* <button className='reArrange' onClick={props.reArrange}>Rearrange photos</button> */}
              <div className='photoCount'> {props.selected + 1} of {props.length} </div>
            </div>
            <button onClick={props.onClick} className='arrow'> </button>
          </div>
        </div>
        {/* creates form when rearrange is selected */}
        <div id="showForm" className="showForm"> 
          <form onSubmit={props.handleSubmit}>
            <label>
              Name:
              <input type="text" />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
    </div>
  )
}

function RenderGroupPage(props){
  return (
    <div className='gridPage'>
      <button onClick={props.goBack} className='arrowBack'> </button>
      <div className='group'>       
      {
        props.gallery.map((img, index) => {
          return <div key={index}> <img id={img.img_order} onClick={props.imgClick} src={img.img_url} alt='' className='photoSize'/> </div>
        })
      } 
      </div>
      <button onClick={props.onClick} className='arrow'> </button>
      {/* creates template for when img is selected */}
      <div id='photoModal' className='photoModal'>
        <div className='photoSelectGrid'> 
          <button onClick={props.goBack} className='arrowBack'> </button> 
          <div className='photoContent'>
            <span onClick={props.closeModal} className="close">&times;</span>
            <div id='photoCount' className='photoCount'> {props.selected + 1} of {props.length} </div>
            <img id='imgSelected' src='' alt='' width="800" height="700"/>
          </div>
          <button onClick={props.onClick} className='arrow'> </button>
        </div>
      </div>
    </div>
  )
}


function getIndex(arr){
  var index = {};
  index['start'] = arr[0].img_order;
  index['end'] = arr[arr.length - 1].img_order;
  return index;
}

class Zillow extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      photoSelected: null,
      gallery: [],
      display: {
        main: [],
        group: []
      },
      value: '',
      mainPage: true,
      index: {},
      url: "localhost"
    };
    this.deletePhoto = this.deletePhoto.bind(this);
    this.closePhotoModal = this.closePhotoModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  updatePhoto(e) {
    var path = window.location.pathname.split('/');
    var house = path[1];
    var self = this;
    const {photoSelected, value, url} = this.state;
    $.ajax({
      method: 'PUT',
      url: `http://${url}:3002/gallery/${house}/photo/${photoSelected}/url/${value}`,
      success: function(data) {
        //update gallery
        $.ajax({
          method: 'GET',
          url: `http://${url}:3002/gallery/${house}`,
          success: function(data) {
            var result = {
              main: data[0],
              group: data.slice(1, 5)
            };
            self.setState({
              houseId: house, 
              gallery: data, 
              display: result
            });
            self.closePhotoModal();
          } 
        });
      }
    });
    this.closePhotoModal();
  }
  handleChange(event) {
    const {value} = event.target;
    this.setState({value});
  }
  deletePhoto(e) {
    var path = window.location.pathname.split('/');
    var house = path[1];
    var self = this;
    $.ajax({
      method: 'DELETE',
      url: `http://${this.state.url}:3002/gallery/${house}/photo/${this.state.photoSelected}`,
      success: function(data) {
        //update gallery
        $.ajax({
          method: 'GET',
          url: `http://${self.state.url}:3002/gallery/${house}`,
          success: function(data) {
            var result = {
              main: data[0],
              group: data.slice(1, 5)
            };
            self.setState({
              houseId: house, 
              gallery: data, 
              display: result
            });
            self.closePhotoModal();
          } 
        });
      } 
    });
  }
  handleNext(e){
    if(this.state.photoSelected === null) {
      var newPhotos = this.state.gallery.slice(3,10);
      this.setState({
        display: {
          main: [],
          group: newPhotos
        },
        mainPage: false
      })
    } else {
      var nextPhoto = this.state.photoSelected + 1;
      if(nextPhoto < this.state.gallery.length) {
        var img = document.getElementById('imgSelected');
        img.src = this.state.gallery[nextPhoto].img_url;
        this.setState({photoSelected: nextPhoto});
      }
    }
  }

  handleBack(e){
    if(this.state.photoSelected === null) {
      var result = {
        main: this.state.gallery[0],
        group: this.state.gallery.slice(1, 5)
      };
      this.setState({
        display: result,
        mainPage: true
      })
    } else {
      var nextPhoto = this.state.photoSelected - 1;
      if(nextPhoto >= 0) {
        var img = document.getElementById('imgSelected');
        img.src = this.state.gallery[nextPhoto].img_url;
        this.setState({photoSelected: nextPhoto});
      }
    }
  }

  imgClick(e){
    var modal = document.getElementById('photoModal');
    modal.style.display = "block";
    var img = document.getElementById('imgSelected');
    img.src = e.target.src;
    this.setState({photoSelected: Number(e.target.id)});
  }

  closePhotoModal(e){
    var modal = document.getElementById('photoModal');
    modal.style.display = "none";
    var img = document.getElementById('imgSelected');
    img.src = '';
    this.setState({photoSelected: null});
  }

  reArrange(){
    var modal = document.getElementById('photoModal');
    modal.style.display = "none";
    var img = document.getElementById('imgSelected');
    img.src = '';
    var form = document.getElementById('showForm');
    form.style.display = "block";
    this.setState({photoSelected: null});
  }

  submitForm(e){
    console.log(e);
  }

  componentDidMount(){
    var state = this;
    var path = window.location.pathname.split('/');
    var house = path[1];
    $.ajax({
      method: 'GET',
      url: `http://${this.state.url}:3002/gallery/${house}`,
      success: function(data){
        console.log('data', data)
        var result = {
          main: data[0],
          group: data.slice(1, 5)
        };
        state.setState({
          houseId: house, 
          gallery: data, 
          display: result
        });
      } 
    });
  }

  render() {
    return ( (this.state.mainPage)
    ? <RenderMainPage gallery={this.state.display.group} 
    mainPg={this.state.mainPage} mainPhoto={this.state.display.main}
    onClick={this.handleNext.bind(this) } goBack={this.handleBack.bind(this)}
      imgClick={this.imgClick.bind(this)} closeModal={this.closePhotoModal.bind(this)}
      selected={this.state.photoSelected} length={this.state.gallery.length} 
      reArrange={this.reArrange.bind(this)} handleSubmit={this.submitForm.bind(this)}
      deletePhoto={this.deletePhoto.bind(this)} updatePhoto={this.updatePhoto.bind(this)}
      handleChange={this.handleChange.bind(this)}
    />
    : <RenderGroupPage gallery={this.state.display.group} 
      onClick={this.handleNext.bind(this) } goBack={this.handleBack.bind(this)}
      imgClick={this.imgClick.bind(this)} closeModal={this.closePhotoModal.bind(this)}
      selected={this.state.photoSelected} length={this.state.gallery.length}
      deletePhoto={this.deletePhoto.bind(this)} updatePhoto={this.updatePhoto.bind(this)}
      handleChange={this.handleChange.bind(this)}
    />)
  }
}
 

ReactDOM.render(<Zillow />, document.getElementById('gallery'))

