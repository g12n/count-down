import { readFileSync, existsSync } from "node:fs";

import { getComponentDetailsTemplate, getComponentByTagName , getAllComponents} from '@wc-toolkit/cem-utilities';

import { options } from '../../scripts/readme-options.js';
import manifest from '../../custom-elements.json' with { type: 'json' };

const components = getAllComponents(manifest);




export default function () {
  

    for (const index in components ){
        const component = components[index];
        console.log(component)
        components[index].componentDetails = getComponentDetailsTemplate(component, options);

    }
    return components;
}