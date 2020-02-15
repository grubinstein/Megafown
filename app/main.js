'use strict'
import './main.scss';
import './modules/speak';
import './modules/autocomplete'; 
import makeMap from './modules/map';
import { $, $$ } from './modules/bling'
import { removeFlash } from './modules/flashes'

$('#map') && makeMap($('#map'));