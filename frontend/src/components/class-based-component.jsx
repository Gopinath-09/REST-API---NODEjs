import { Component } from "react";


class ClassbasedComponent extends Component{
    state = {
        showText : false
    }
    handleClick=()=>{
        this.setState({
            showText: !this.state.showText
        })
    }
    render(){
        console.log(this.state.showText);
        return <div>
            <h2>REACT</h2>
            {this.state.showText ? <p>THIS IS CONTENT</p> : null}
            <button onClick={this.handleClick}>TOGGLE</button>
        </div>
    }
}

export default ClassbasedComponent;