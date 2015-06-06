
/**
* The Javascript library and corresponding server components (websocket support) are work in 
* progress and currently made available in public beta.
* 
* Please report any bugs not listed yet and feel free to suggest additional features
* for the final version. Mail to: developer@exitgames.com
**/

      ___        ___           ___                      ___           ___
     /\  \      /\  \         /\  \                    /\  \         /\  \  
    /::\  \     \:\  \       /::\  \         ___      /::\  \        \:\  \ 
   /:/\:\__\     \:\  \     /:/\:\  \       /\__\    /:/\:\  \        \:\  \ 
  /:/ /:/  / ___ /::\  \   /:/  \:\  \     /:/  /   /:/  \:\  \   _____\:\  \ 
 /:/_/:/  / /\  /:/\:\__\ /:/__/ \:\__\   /:/__/   /:/__/ \:\__\ /::::::::\__\
 \:\/:/  /  \:\/:/  \/__/ \:\  \ /:/  /  /::\  \   \:\  \ /:/  / \:\~~\~~\/__/
  \::/__/    \::/__/       \:\  /:/  /  /:/\:\  \   \:\  /:/  /   \:\  \  
   \:\  \     \:\  \        \:\/:/  /   \/__\:\  \   \:\/:/  /     \:\  \   
    \:\__\     \:\__\        \::/  /         \:\__\   \::/  /       \:\__\  
     \/__/      \/__/         \/__/           \/__/    \/__/         \/__/ 


*** EXIT GAMES PHOTON JAVASCRIPT LIBRARY

** README

The Photon Javascript library provides a simple to use framework to access the Photon Server
and the Photon Cloud. It works on many up to date browsers using either native WebSocket or 
a Flash plugin.
Cross platform communication is possible, so Javascript clients can send events to DotNet or
native clients. This might require some adjustments on other platforms. This is shown 
by the "Particle" demo.


Lite extends the basic Photon Peer by Lite application's operations and events:
http://doc.exitgames.com/photon-server/LiteConcepts/#cat-Application%20-%20Lite%20&%20Lite%20Lobby

LoadBalancing extends Lite to support multiple servers and adds many features. 
The LoadBalancing API is compatible with the Photon Cloud and servers you host yourself, 
using the Photon Server SDK.
http://doc.exitgames.com/photon-cloud


The latest version of Photon and Photon libraries can be found at
http://www.exitgames.com/Download/Photon


The reference documentation is in this package. More documentation for Photon development:
http://doc.exitgames.com/photon-cloud


To get in touch with other Photon developers and our engineers, visit our Developer Forum:
http://forum.exitgames.com.

Keep yourself up to date following Exit Games on Twitter <http://twitter.com/exitgames>
and our blog at http://blog.exitgames.com.

** PACKAGE CONTENTS

license.txt         - the license terms
install.txt         - installation info
readme.txt          - this readme text
release_history.txt - release history
/doc                - the Javascript API reference documentation
/lib                - the different versions of the lib
/src    
    /demo-chat              - basic chat sample using Lite (no Cloud suport)
    /demo-loadbalancing     - basic loadbalanced demo
    /demo-particle          - demo showing more of the API's features (Cloud, cross platform)
    /demo-chat-api          - Corona demo showing Photon Chat API's features
    /Photon                 - library typescript source files

