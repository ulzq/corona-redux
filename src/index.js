
import * as serviceWorker from './serviceWorker';

import React    from 'react';
import ReactDOM from 'react-dom';

import { createStore }       from 'redux'
import { connect, Provider } from 'react-redux';

import TextField             from '@material-ui/core/TextField'
import Checkbox              from '@material-ui/core/Checkbox'
import FormControlLabel      from '@material-ui/core/FormControlLabel'
import Button                from '@material-ui/core/Button'

import Paper                 from '@material-ui/core/Paper'
import Grid                  from '@material-ui/core/Grid'

import EditIcon              from '@material-ui/icons/Edit'
import HighlightOffIcon      from '@material-ui/icons/HighlightOff'
import AddCircleOutlineIcon  from '@material-ui/icons/AddCircleOutline'

import './index.css';

import App from './App';

const defaultState = {
  name:"",
  testPositiv:false,
  positiv:[ "anx" ],
  negativ:[ "shahin" ]
};

function patientHinzufügen(state){
  const welcheListe = state.testPositiv ? 'positiv' : 'negativ';
  // Mit array.push würde Redux nicht verstehen dass der Array
  // sich geändert hat.
  const neueListe = [ ...state[welcheListe], state.name ];
  return { ...state, [welcheListe]:neueListe };
}

function reducer ( state = defaultState, action ){
  const { type, name, liste, index } = action;
  let neueListe;
  switch ( type ){
    case "nameÄndern":
      state = { ...state, name }; break;
    case "testergebnisUmschalten":
      state = { ...state, testPositiv: ! state.testPositiv }; break;
    case "patientHinzufügen":      state = patientHinzufügen(state); break;
    case "patientBearbeiten":
      // Erstelle eine Kopie von der Liste, aus welcher wir den Patienten löschen wollen.
      neueListe = [ ...state[liste] ]; // neueListe = state[liste].slice()
      const [ eintrag ] = neueListe.splice( index, 1 );
      state = {
        ...state,
        [liste]:     neueListe,
        name:        eintrag,
        testPositiv: liste === 'positiv'
      };
      break;
    case "patientLöschen":
      // Erstelle eine Kopie von der Liste, aus welcher wir den Patienten löschen wollen.
      neueListe = [ ...state[liste] ]; // neueListe = state[liste].slice()
      neueListe.splice( index, 1 );
      state = { ...state, [liste]: neueListe };
      break;
    default:
  }
  return state;
}

function mapActionsToProps ( dispatch ){
  return {
    testergebnisUmschalten:       ()=> { dispatch({ type:"testergebnisUmschalten"             }) },
    patientHinzufügen:            ()=> { dispatch({ type:"patientHinzufügen"                  }) },
    nameÄndern:               (name)=> { dispatch({ type:"nameÄndern",            name        }) },
    patientLöschen:    (liste,index)=> { dispatch({ type:"patientLöschen",        liste,index }) },
    patientBearbeiten: (liste,index)=> { dispatch({ type:"patientBearbeiten",     liste,index }) },
  }
}

const mapStateToProps = state => state;

const adapter = connect(
  mapStateToProps,
  mapActionsToProps
);

/*
  Die Eingabe Komponente ist dafür da neue Patienten zu erfassen,
  oder bestehende Patienten zu bearbeiten.
    - Sie ist mit redux durch den adapter verbunden und erhält somit
      alle props und actions
    - Wichtig: die Checkbox bekommt ihren Wert nich aus der value-prop
      sondern aus der __ checked-prop __
*/

const Eingabe = adapter( function({
    name, nameÄndern,
    testPositiv, testergebnisUmschalten,
    patientHinzufügen
}){
  return (
  <Grid container>
    <Grid item>
      <TextField fullWidth
        label="Name"
        value={name}
        onChange={e => nameÄndern(e.target.value)}
      />
    </Grid>
    <Grid item>
      <FormControlLabel
        control={
        <Checkbox
          value="positiv"
          checked={testPositiv}
          onClick={testergebnisUmschalten}
        />
        }
        label="Test Positiv"
      />
    </Grid>
    <Grid item>
      <Button onClick={patientHinzufügen}>
        <AddCircleOutlineIcon/>
      </Button>
    </Grid>
  </Grid> );
});

/*
  Die Liste Komponente soll für postiv und negativ getestete patienten benutzt werden.
    - Die prop {was}(String) erhält entweder "positiv" oder "negativ"
      diese prop wird später auch an die actions ( patientBearbeiten, patientLöschen )
      weitergegeben. Ausserdem könne wir mit hilfe dieser prop den entsprechenden
      Array (props.positiv, props.negativ) auswählen ( mittels props[was] )
    - Deswegen destrukturieren wir ausnahmsweise mal nicht direkt,
      sondern nehmen unsere props erstmal in die props Variable,
      um dann die variablen die wir brauchen zu destrukturieren, bzw. lesen.
*/

const Liste = adapter(
function( props ){
  const { patientLöschen, patientBearbeiten, was } = props;
  const liste = props[was];
  return (
  <table>
    <tr><th>{was}</th></tr>
    { liste.map( (patient,index) =>
      <tr>
        <td>{patient}</td>
        <td>
          <Button onClick={ e => patientBearbeiten(was,index) }>
            <EditIcon/>
          </Button>
          <Button onClick={ e => patientLöschen(was,index) }>
            <HighlightOffIcon/>
          </Button>
        </td>
      </tr>
    )}
  </table> );
});

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <Paper style={{padding:'5px',margin:'5px'}}>
      <Eingabe/>
    </Paper>
      <Grid container>
        <Grid item xs={6}>
          <Paper style={{padding:'5px',margin:'5px'}}>
            <Liste was="positiv"/>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper style={{padding:'5px',margin:'5px'}}>
            <Liste was="negativ"/>
          </Paper>
        </Grid>
      </Grid>
  </Provider>
, document.getElementById('root'));

serviceWorker.unregister();
