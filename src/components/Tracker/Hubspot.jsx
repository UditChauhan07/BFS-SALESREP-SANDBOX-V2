import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GetAuthData } from '../../lib/store';

const HubSpotTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (window.hj) {
          window.hj('stateChange', location.pathname);
          GetAuthData().then((user)=>{
            
            if(user){
              if(user?.data){
                window.hj('identify', user.data.retailerId, {
                  userName: user.data.firstName +' '+user.data.lastName ,
                  email: user.data.email,
                  phone: user.data.phone,
                  // accounts:accountList.length ? 
                  // accountList.map(e=>e.Name)
                  //  :null
                });
              }
            }
            
          }).catch((err)=>console.log({err}))
        }
        console.log({aa:location.pathname});
        
      }, [location]);

    return null; // This component doesn't render anything
};

export default HubSpotTracker;