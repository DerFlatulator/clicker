'use strict';

import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';
import 'jquery.cookie'; // $.cookie
import querystring from 'querystring';

class BubbleSort extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            list: [1,2,3],
            bs: -1
        };
    }

    componentDidMount() {
        //console.log(this.props.url);

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: (data) => {
                console.log(data);
                this.setState({
                    list: data.current_list,
                    bs: data.url
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });

        this.props.socket.on(`bubblesort.${this.props.clickerClass}`, message => {
            let data = JSON.parse(message);

            console.log(data);
            let url = this.props.url.substring(this.props.url.indexOf('/api/'));

            if (data.event_type === 'swap') {
                if (url == data.bubble_sort) {
                    this.swapListIndex(data.lower_index);
                }
            }

        });
    }

    swapListIndex(index) {
        var list = this.state.list;
        var tmp = list[index];
        list[index] = list[index + 1];
        list[index + 1] = tmp;
        this.setState({ list });
    }

    colourFromValue(value) {
        var max = Math.max.apply(null, this.state.list.map(v =>  parseInt(v))),
            hue = value * 256 / max;

        if (isNaN(max)) {
            return "blue";
        }

        return `hsl(${String(Math.floor(hue))}, 40%, 50%)`;
    }

    render() {
        var bottomStyles = {
            width: 66 * this.state.list.length
        };

        return (
            <div>
                <h3>Bubble Sort</h3>
                <div className="sortList">
                    {this.state.list.map((item, index) => {
                        var colour = this.colourFromValue(item);
                        return (
                            <BubbleSortItem colour={colour} key={item} index={index} item={item}></BubbleSortItem>
                        );
                    })}
                    {this.state.list.map((_, index) => {
                        if (index === 0)
                            return;

                        return (
                            <BubbleSortCaption bs={this.state.bs} key={index} index={index}></BubbleSortCaption>
                        );
                    })}
                    <div className="sortFooter" style={bottomStyles}>Invervals</div>
                </div>
            </div>
        );
    }
}

class BubbleSortItem extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            height_multiplier: 15,
            width_multiplier: 33
        };
    }

    render() {
        return (
            <div className="sortItem"
                 style={{
                    background: this.props.colour,
                    height: (this.state.height_multiplier * this.props.item) + 10 + 'px',
                    left: (this.state.width_multiplier * this.props.index) + 'px'
                 }}>
                {this.props.item}
            </div>
        );
    }
}

class BubbleSortCaption extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            width_multiplier: 33
        };
    }

    handleClick = (e) => {
        var interval = $(e.target).text();
        $.post('/api/bubblesortswap/', {
            lower_index: interval - 1,
            bubble_sort: this.props.bs
        });
    };

    render() {
        return (
            <div onClick={this.handleClick}
                 className="sortCaption"
                 style={{
                    height: (this.state.height_multiplier) + 'px',
                    left: (this.state.width_multiplier * (this.props.index - 0.5)) + 'px'
                 }}>
                {this.props.index}
            </div>
        );
    }
}

window.interactions = $.extend(window.interactions, { BubbleSort });