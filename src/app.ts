import './config'
import {bootstrap} from "@/app/bootstrap";

bootstrap()
    .then(() => {
        console.log('app running');
    })
    .catch((err) => {
        console.error(err);
    })

