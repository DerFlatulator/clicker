/**
 * :file: creator/creator_index
 */
     
class CreatorIndex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div>
                <h3>Creator (TODO)</h3>
                <p><a href="/">Go back.</a></p>
            </div>);
    }
}

let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    React.render(
        <CreatorIndex user={$context.user} date={new Date()}/>,
        document.getElementById('react-main')
    );
};
run();