"use strict";

/**
 * :file: creator/create_graph
 */

import React from 'react';
import $ from 'jquery';
import classNames from 'classnames';


class RuleModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // Move all embedded modals out to the <body> tag.
        $('.modal').appendTo('body');
    }

    componentDidUpdate() {
        // Move all embedded modals out to the <body> tag.
        $('.modal').appendTo('body');
    }

    render() {
        return (
            <strong>Use a subclass of RuleModal</strong>
        );
    }
}

class RuleEditModal extends RuleModal {
    constructor(props) {
        super(props);
    }

    render () {
        let label = this.props.label || "";
        let text = label ? label.text() : "";
        let id = label.id;
        let group = this.props.group;

        return (
            <div id={id} className="modal">
                <div className="modal-content">
                    <h4>{group}</h4>
                    <p className="flow-text">{text}</p>
                    {label.form()}
                </div>
                <div className="modal-footer">
                    <a href="#!"
                       className="modal-action modal-close waves-effect waves-green btn-flat">
                        Save</a>
                </div>
            </div>
        );
    }
}

class RuleCreateModal extends RuleModal {
    constructor(props) {
        super(props);
    }

    render() {
        let rules = this.props.rules;
        let id = this.props.id;

        return (
            <div id={id} className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4>New {id[0].toUpperCase() + id.substring(1)} Rule</h4>
                    <div className="row">
                        <p className="col s12 m6 l4">Select a rule to add:</p>
                        <select className="input-field browser-default col s12 m6 l8">
                        {rules.map(rule =>
                            <optgroup key={rule.group} label={rule.group}>
                            {rule.labels.map(label =>
                                <option key={label.id}>{label.description}</option>
                            )}
                            </optgroup>
                        )}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <a href="#!"
                       className="modal-action modal-close waves-effect waves-green btn-flat">
                        Save</a>
                </div>
            </div>
        );
    }
}

class RuleGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    del = () => {
        console.error("unimplemented: delete");
    };

    render() {
        let rule = this.props.rule;

        return (
            <ul className="no-margin collection with-header">
                <li className="collection-header flow-text">{rule.group}</li>

                {rule.labels.map(label => {
                    let id = '#' + label.id;

                    return <li key={label.id} className="collection-item">

                        <RuleEditModal group={rule.group} label={label} />

                        <a className="modal-trigger"
                           href={id}>
                            {label.text()}
                        </a>

                        <a href="#" onClick={this.del} className="red-text secondary-content">
                            <i className="material-icons">delete</i>
                        </a>
                    </li>
                })}
            </ul>
        );
    }

}

class RulePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        let icon = this.props.icon;
        let title = this.props.title;
        let rules = this.props.rules;
        let id = this.props.id;
        let buttonClasses = classNames('waves-effect', 'waves-light', 'btn', 'modal-trigger');

        return (
            <li>
                {/* Collection */}
                <div className="collapsible-header active">
                    <i className="material-icons">{icon}</i>
                    {title}
                </div>
                <div className="collapsible-body">
                    {rules.map(rule => {
                        return (
                            <div key={rule.group}>
                                <RuleGroup rule={rule} />
                            </div>
                        );
                    })}
                    <div className="button-row">
                        <a href={'#' + id} className={buttonClasses}>
                            New Rule
                            <i className="material-icons right">add_circle</i>
                        </a>
                    </div>
                </div>
                <RuleCreateModal rules={rules} id={id} />
            </li>
        );
    }
}

class VertexRulePanel extends React.Component {

    constructor(props) {
        super(props);
        this.title = "Vertex Rules";
        this.icon = "account_circle";
        this.id = "vertex";
        this.rules = [
            {
                group: "A client can...",
                labels: [
                    {
                        text: function () {
                            var str = " new vertices";
                            if (this.state.create && this.state.del) {
                                str = "Create and delete" + str;
                            } else if (this.state) {
                                str = "Create" + str;
                            } else if (this.del) {
                                str = "Delete" + str;
                            } else {
                                str = "";
                            }
                            return str;
                        },
                        description: "Create new vertices",
                        id: "vertex-create",
                        state: { create: true, del: false },
                        form: function () {
                            return (
                                <form className="row">

                                    <div className="switch">
                                        <label>
                                            Numeric label
                                            <input type="checkbox" />
                                            <span className="lever"></span>
                                            Client can label
                                        </label>
                                    </div>

                                    {/*<p className="input-field">
                                        <label htmlFor="can_label">Can label</label>
                                        <input type="checkbox" checked="checked" id="can_label" />
                                    </p>

                                    <p>
                                        <label htmlFor="client">Client can colour</label>
                                        <input type="radio" name="color" id="client" value="client" />
                                    </p>
                                    or
                                    <p>
                                        <span className="red"><input type="radio" name="color" value="red" /></span>
                                        <span className="green"><input type="radio" name="color" value="green" /></span>
                                        <span className="blue"><input type="radio" name="color" value="blue" /></span>
                                        <span className="yellow"><input type="radio" name="color" value="yellow" /></span>
                                    </p> */}

                                    <div className="switch">
                                        <label>
                                            Client can only create
                                            <input type="checkbox" />
                                            <span className="lever"></span>
                                            Client can delete vertices they created
                                        </label>
                                    </div>

                                    <select className='browser-default'>
                                        <option>Client can colour vertices</option>
                                        <option>Client vertices are red</option>
                                        <option>Client vertices are orange</option>
                                        <option>Client vertices are yellow</option>
                                        <option>Client vertices are green</option>
                                        <option>Client vertices are blue</option>
                                    </select>


                                </form>
                            );
                        },
                        updateState: function (formData) {

                        }
                    }
                ]
            },
            {
                group: "A client has...",
                labels: [
                    {
                        text: function () { return `${this.state.number} assigned vertices.` },
                        description: "Assigned vertices",
                        id: "assigned-vertex",
                        state: { number: 1 },
                        form: function () {
                            return (
                                <form>
                                    <label>Number of vertices to assign to each client</label>
                                    <input type="number" min={1} onChange={this.change}  value={this.state.number} />
                                </form>
                            );
                        },
                        change: function () {

                        }
                    }
                ]
            }
        ];
    }

    render() {
        return <RulePanel title={this.title}
                          icon={this.icon}
                          id={this.id}
                          rules={this.rules} />;
    }
}

class EdgeRulePanel extends React.Component  {

    constructor(props) {
        super(props);
        this.title = "Edge Rules";
        this.icon = "trending_flat";
        this.id = "edge";
        this.rules = [
            {
                group: "A client can...",
                labels: [
                    {
                        text: function() {
                            var s = [], t = [];
                            var str = "Create edges from ";
                            if (this.state.fromClient)
                                s.push("client");
                            if (this.state.fromFixed)
                                s.push("fixed");
                            if (this.state.fromAssigned)
                                s.push("assigned");
                            if (this.state.fromOther)
                                s.push("other");

                            str += s.join(" & ") + " vertices to ";

                            if (this.state.toClient)
                                t.push("client");
                            if (this.state.toFixed)
                                t.push("fixed");
                            if (this.state.toAssigned)
                                t.push("assigned");
                            if (this.state.toOther)
                                t.push("other");

                            str += t.join(" & ") + " vertices";

                            if (this.state.del)
                                str += ", and delete them";
                            else str += ".";

                            return str;
                        },
                        description: "Create edges.",
                        id: "create-edge",
                        state: {
                            fromClient: false, fromFixed: false,
                            fromAssigned: true, fromOther: false,
                            toClient: false, toFixed: true,
                            toAssigned: false, toOther: false,
                            del: false
                        },
                        form: function () {
                            return (
                                <form>
                                    From:
                                    <select onChange={this.changeTo} className="browser-default">
                                        <option value="fromClient">From any client vertex</option>
                                        <option value="fromFixed">From fixed vertex</option>
                                        <option value="fromAssigned">Vertex assigned to the client</option>
                                        <option value="fromOther">Other vertices</option>
                                    </select>

                                    To:
                                    <select onChange={this.changeFrom} className="browser-default">
                                        <option value="fromClient">From any client vertex</option>
                                        <option value="fromFixed">From fixed vertex</option>
                                        <option value="fromAssigned">Vertex assigned to the client</option>
                                        <option value="fromOther">Other vertices</option>
                                    </select>

                                    <div className="switch">
                                        <label>
                                            Numeric label
                                            <input type="checkbox" />
                                            <span className="lever"></span>
                                            Client can label
                                        </label>
                                    </div>

                                    <div className="switch">
                                        <label>
                                            Client can only create
                                            <input type="checkbox" />
                                            <span className="lever"></span>
                                            Client can delete vertices they created
                                        </label>
                                    </div>

                                    <select onChange={this.changeColor} className='browser-default'>
                                        <option>Client can colour vertices</option>
                                        <option>Client edges are black</option>
                                        <option>Client edges are red</option>
                                        <option>Client edges are yellow</option>
                                        <option>Client edges are green</option>
                                        <option>Client edges are blue</option>
                                    </select>

                                </form>
                            );
                        },
                        changeTo: function () { },
                        changeFrom: function () { },
                        changeColor: function () { }
                    }
                ]
            }
        ];
    }

    render() {
        return <RulePanel title={this.title}
                          icon={this.icon}
                          id={this.id}
                          rules={this.rules} />;
    }

}

class StructureRulePanel extends React.Component {

    constructor(props) {
        super(props);
        this.title = "Structure Rules";
        this.icon = "settings";
        this.id = "structure";
        this.rules = [
            {
                group: "The graph may...",
                labels: [
                    {
                        text: () => "Have repeated edges.",
                        description: "Have repeated edges.",
                        id: "multi-graph",
                        form: function () {
                            return <form>
                                This is called a multigrpah. It allows repeated edges and loops.
                            </form>;
                        }
                    }
                ]
            },
            {
                group: "The graph will...",
                labels: [
                    {
                        text: () => "Be directed.",
                        id: "directed",
                        form: function () {
                            return <form></form>;
                        }
                    }
                ]
            }
        ];
    }

    render() {
        return <RulePanel title={this.title}
                          icon={this.icon}
                          id={this.id}
                          rules={this.rules} />;
    }

}

class StartingGraphPanel extends React.Component  {

    constructor(props) {
        super(props);
        this.title = "Starting Graph";
        this.icon = "share";
        this.id = "starting";
        this.rules = [
            {
                group: "The graph starts with...",
                labels: [
                    {
                        text: function () {
                            var str = "Vertices: ";

                            str += this.state.vertices.map(vertex => `"${vertex.label}"`)
                                                      .join(", ");
                            str += ".";

                            return str;
                        },
                        description: "Vertices:",
                        id: "start-vertex",
                        state: { vertices: [
                            { label: "John" }, { label: "Paul" }, { label: "George" }
                        ] },
                        form: function () {
                            return <form>
                                <textarea className='materialize-textarea'
                                    value={this.state.vertices.map(vertex => vertex.label).join('\n')}>
                                    </textarea>
                            </form>
                        }
                    },
                    {
                        text: function () {
                            var str = "Edges: ";

                            str += this.state.edges.map(e => `"${e.from}" to "${e.to}"`)
                                .join(", ");
                            str += ".";

                            return str;
                        },
                        description: "Edges:",
                        id: "start-edges",
                        state: { edges: [
                            { from: "John", to: "Paul" }, { from: "Paul", to: "George" }
                        ] },
                        form: function () {
                            return <form>
                                Enter vertex labels separated by <code>--</code>.

                                <textarea className='materialize-textarea'
                                    value={this.state.edges.map(e => `${e.from} --- ${e.to}`).join('\n')}>
                                    </textarea>
                            </form>;
                        }
                    }
                ]
            }
        ];
    }

    render() {
        return <RulePanel title={this.title}
                          icon={this.icon}
                          id={this.id}
                          rules={this.rules} />;

    }

}

class CreateGraphRulesApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        $('.modal-trigger').leanModal();
    }

    save = () => {
        console.error("unimplemented: save");
    };

    render() {
        let buttonClasses = classNames('waves-effect', 'waves-light', 'btn-large', 'modal-trigger');

        return (
            <div>
                <h3>Rule Builder</h3>

                <ul className="collapsible popout" data-collapsible="expandable">
                    <VertexRulePanel />
                    <EdgeRulePanel />
                    <StructureRulePanel />
                    <StartingGraphPanel />
                </ul>

                <div className="right">
                    <a href="#" onClick={this.save} className={buttonClasses}>
                        Save Rules
                        <i className="material-icons right">save</i>
                    </a>

                    {/*<div className="fixed-action-btn" style={{bottom: 66, right: 24}}>
                        <a className="btn-floating btn-large green">
                            <i className="large material-icons">save</i>
                        </a>
                        <ul>
                        </ul>
                    </div>*/}
                </div>
            </div>
        );
    }
}


let run = function () {
    $.ajaxSetup({
        beforeSend: req => req.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'))
    });

    React.render(
        <CreateGraphRulesApp />,
        document.getElementById('react-main')
    );
};
run();