'use strict';

class BubbleSort extends React.Component {

    constructor(props) {
        super (props);
        this.state = {
            list: [1,2,3]
        };
    }

    componentDidMount() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: data => {
                console.log(data.current_list);
                this.setState({
                    list: data.current_list
                });
            },
            error: (xhr, status, err) => {
                console.error(this.props.url, status, err.toString());
            }
        });

        $(function () {
            var path = 'http://#1:4000/#2',
                socket = io(path.replace('#1', window.location.hostname)
                                .replace('#2', String(this.props.channel)));

            socket.on('connect', function () {
                console.log('socket connected');
            });

            socket.on('message', message => {
                console.log(message);
                let data = JSON.parse(message);
                if (this.props.id == data.bubble_sort) {
                    this.swapListIndex(data.lower_index);
                }
            });
        }.bind(this));
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

        return "hsl(" + String(Math.floor(hue)) + ", 40%, 50%)";
    }

    render() {
        var bottomStyles = {
            width: 66 * this.state.list.length
        };

        return (
            <div>
                <h2>Bubble Sort</h2>
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
                            <BubbleSortCaption key={index} index={index}></BubbleSortCaption>
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
            height_multiplier: 30,
            width_multiplier: 66
        };
    }

    render() {
        return (
            <div className="sortItem"
                 style={{
                    background: this.props.colour,
                    height: (this.state.height_multiplier * this.props.item) + 'px',
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
            width_multiplier: 66
        };
    }

    render() {
        return (
            <div className="sortCaption"
                 style={{
                    height: (this.state.height_multiplier) + 'px',
                    left: (this.state.width_multiplier * (this.props.index - 0.5)) + 'px'
                 }}>
                {this.props.index}
            </div>
        );
    }
}

let run = function () {

    var socketURL = "//#:4000/socket.io/socket.io.js".replace('#', window.location.hostname),
        instance = parseInt($.url().param('instance')) || 1,
        url = "/api/bubblesort/view/#/".replace('#', String(instance)),
        channel = "bubblesort.observer";

    /*
     * Wait for socket code to load before activating React.
     * React will briefly render the default state, then
     * update when the first GET request completes.
     */
    $.getScript(socketURL, function () {
        React.render(
            <BubbleSort url={url} channel={channel} id={instance} date={new Date()}/>,
            document.getElementById('react-main')
        );
    });

};
run();