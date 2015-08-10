'use strict';

var React = require('react');
var Immutable = require('immutable');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Button = require('react-bootstrap').Button;

var RolesStore = require('../../stores/users/RolesStore').RolesStore;
var PermissionsMixin = require('../../util/PermissionsMixin');

var EditRole = React.createClass({
    mixins: [PermissionsMixin],

    propTypes: {
        initialRole: React.PropTypes.object,
        onSave: React.PropTypes.func.isRequired,
        cancelEdit: React.PropTypes.func.isRequired
    },

    getInitialState() {
        let role = this.props.initialRole;
        if (role === null) {
            // for the create dialog
            role = {name: null, description: null, permissions: [""]};
        }
        return {
            role: role,
            initialName: this._safeRoleName(this.props.initialRole)
        };
    },

    _safeRoleName(role) {
        return role === null ? null : role.name;
    },

    componentWillReceiveProps(newProps) {
        this.setState({role: newProps.initialRole, initialName: this._safeRoleName(newProps.initialRole)});
    },

    _setName(ev) {
        let role = this.state.role;
        role.name = ev.target.value;
        this.setState({role: this.state.role});
    },
    _setDescription(ev) {
        let role = this.state.role;
        role.description = ev.target.value;
        this.setState({role: this.state.role});
    },

    render() {
        let titleText;
        if (this.state.initialName === null) {
            titleText = "Create a new role";
        } else {
            titleText = "Edit role " + this.state.initialName;
        }
        return (
            <Row>
                <Col md={12}>
                    <h1>{titleText}</h1>
                    <form>
                        <label htmlFor="role-name">Name:</label>
                        <input id="role-name" type="text" className="form-control" onChange={this._setName} value={this.state.role.name} required/>

                        <label htmlFor="role-description">Description:</label>
                        <input id="role-description" type="text" className="form-control" onChange={this._setDescription} value={this.state.role.description}/>

                        <Button onClick={ev => this.props.onSave(this.state.initialName, this.state.role)}>Save</Button>
                        <Button onClick={this.props.cancelEdit}>Cancel</Button>
                    </form>
                </Col>
            </Row>);
    },
});

module.exports = EditRole;
