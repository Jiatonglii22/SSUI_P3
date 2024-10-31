//===================================================================
// Finite State Machine driven interactor v1.0a 10/2023
// by Scott Hudson, CMU HCII 
//
// This and accompanying files provides classes and types which implement a generic
// interactor whose appearance and behavior is controlled by a Finite State Machine (FSM), 
// along with a set of "regions" which determine its appearance, as well as how 
// high-level input events for it are synthized and dispatched. See the comments
// in various classes for details.
//
// Revision history
// v1.0a  Initial version                 Scott Hudson  10/23
//
//===================================================================

import { Root } from "./Root.js";
import { FSM, FSM_json } from "./FSM.js";
import { Region } from "./Region.js";
import { Err } from "./Err.js";

//===================================================================
// Class for an interactive object controlled by a finite state machine (FSM).
// Objects of this class have a position on the screen (the location of their top-left
// corner within the HTML canvas object associated with thier parent (Root) object), 
// Along with an FSM object which specifies, and partially imlements, their behavior.
// This class is repsonsible for using the FSM object to draw all the current region 
// images within the FSM, and for dispatching events to the FSM to drive its behavior.
// Note that this object has a position, but not an explicit size, and that no clipping
// of its output is being done.  Regions within the FSM are positioned in the coordinate
// system of this object (i.e., WRT its top-left corner), and have a size that 
// establishes a bouding box for input purposes (i.e., indicateing which event positions 
// are considered "inside" or "over" the region for input purposes).  However, region 
// image displays are not not limited to that bounding box and are not clipped (except 
// by the containing HTML canvas object).  See the FSM and Root classes for more details.
//=================================================================== 

export class FSMInteractor {
    constructor(
            fsm     : FSM | undefined = undefined,
            x       : number = 0,
            y       : number = 0,
            parent? : Root)
    {
        this._fsm = fsm;
        this._x = x; this._y = y;
        this._parent = parent;
        if (fsm) fsm.parent = this;
    }

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------
  
    // X position (left) of this object within the parent Root object (and containing 
    // HTML canvas)
    protected _x : number;
    public get x() {return this._x;}
    public set x(v : number) {
          
        // **** YOUR CODE HERE ****
        if (!(v === this._x)) {
            this._x = v; 
            this.damage(); // want to declare damaged somehow
        }
    }

    // Y position (top) of this object within the parent Root object (and containing 
    // HTML canvas)
    protected _y : number;
    public get y() {return this._y;}
    public set y(v : number) {
            
        // **** YOUR CODE HERE ****
        if (!(v === this._y)) {
            this._y = v; 
            this.damage(); // want to declare damaged somehow
        }
    }

    // Position treated as a single value
    public get position() : {x: number, y: number} {
        return {x: this.x, y: this.y};
    }

    public set position( v: {x: number, y: number}) {
        if ((v.x !== this._x) || (v.y !== this._y)) {
            this._x = v.x;
            this._y = v.y;
            this.parent?.damage;
        }
    }
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // The parent Root object that hosts this object (and serves as a link to the 
    // underlying HTML canvas) 
    protected _parent : Root | undefined;
    public get parent() {return this._parent;}
    public set parent(v : Root | undefined) {
            
        // **** YOUR CODE HERE ****
        if (!(v === this._parent)) {
            this.damage();
            this._parent = v;
            this.damage();
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // The finite state machine that controls the behavior of this object
    protected _fsm : FSM | undefined;
    public get fsm() {return this._fsm;}

    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------

    // Declare that something managed by this object (most typically a region image, 
    // position, or size within the underlying FSM) has changed in a way that may 
    // make the current display incorrect and in need of update.  This is normally called 
    // from the controlling FSM, in response to damage declarations from its  "child" 
    // regions, etc.  This method passes the damage notification to its hosting Root
    // object which coordinates eventual redraw by calling this object's draw() method.
    public damage() {
           
        // **** YOUR CODE HERE ****
        if (this._parent) {
            //pass damage to Root
            this._parent.damage(); //damage function in Root triggers redraw
        }

    }
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Draw the display for this object using the given drawing context object.  If the
    // showDegugging parameter is passed as true, additional drawing for debugging 
    // purposes (e.g., a black frame showing the bounding box of every region) is 
    // requsted.  See Region.draw() for more details.
    public draw(ctx : CanvasRenderingContext2D, showDebugging : boolean = false) {
        // bail out if we don't have an FSM to work from
        if (!this.fsm) return;

        // **** YOUR CODE HERE ****
        for (let r : number = 0; r < this.fsm.regions.length; r++) {
            let region = this.fsm.regions[r];
            ctx.save();
            ctx.translate(region.x, region.y);
            region.draw(ctx, showDebugging);
            ctx.restore();
        }
    }   

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Perform a "pick" operation, to determine the list of regions in our controlling
    // FSM which the given point is to be considered "inside" of or "over" (i.e., that
    // the given point is within the bounding box of).  The position passed here must 
    // be in the local coordinate system of this object (i.e., the position 0,0 would 
    // be at the top-left of this object).  Note that the "pick list" returned here
    // is ordered in reverse regions drawing order (regions drawn later, appear
    // earlier in the list) so that the region drawn on top of other objects appear
    // before them in the list.
    public pick(localX : number, localY : number) : Region[] {
        let pickList : Region[] = [];

        // if we have no FSM, there is nothing to pick
        if (!this.fsm) return pickList;
           
        // **** YOUR CODE HERE ****
        for (let r : number = 0; r < this.fsm.regions.length; r++) {
            let region = this.fsm.regions[r];
            if (region.pick(localX, localY)) {
                pickList.unshift(region);
             }
        }
        return pickList;
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        
        // **** YOUR CODE HERE ****   
        // You will need some persistent bookkeeping for dispatchRawEvent()
    
    //tracks regions from before
    protected _prevRegions : Region[] = [];

    // Dispatch the given "raw" event by translating it into a series of higher-level
    // events which are formulated in terms of the regions of our FSM.  "Raw" events 
    // are based on simple actions with the input device(s) -- currently just press and
    // release of the first/primary locator button, and locator moves.  "Raw" events are 
    // represented by one of those three event types along with a position (in the local
    // coordinates of this object).  
    //
    // The following higher-level events are generated as translations of a "raw" event:
    // exit <region>, enter <region>, press <region>, move_inside <region>, 
    // release <region>, and release_none.  Multiple of these high level events can be 
    // generated from one "raw" event.  For example, an underlying move event can 
    // generate exit, enter, and move_inside events for multiple regions.  The order
    // of event delivery is to first deliver all exit events, then all enter events, etc.
    // in the order listed above.  Within each event type, events associated with the 
    // last drawn region should be dispatched first (i.e., events are delivered in 
    // reverse region drawing order). Note that all generated higher-level events
    // are dispatched to the FSM (via its actOnEvent() method).
    public dispatchRawEvent(what : 'press' | 'move' | 'release', 
                            localX : number, localY : number) 
    {
        // if we have no FSM, there is nothing to dispatch to
        if (this.fsm === undefined) return;

        // **** YOUR CODE HERE ****

        //get current list of regions 
        let curRegion = this.pick(localX, localY); 

        //get which regions are exited -> was inside prev regions and not in current regions
        let exitRegions = this._prevRegions.filter((region) => !curRegion.includes(region)); 

        //get entered regions -> was not in prev regions but in current regions 
        let enterRegions = curRegion.filter((region) => !this._prevRegions.includes(region)); 

        //order of event delivery - exit first 
        for (let r : number = 0; r < exitRegions.length; r++) {
            let region = exitRegions[r]; 
            this.fsm.actOnEvent('exit', region); 
            //console.log("exit");
        }

        //order of event delivery - enter second 
        for (let r : number = 0; r < enterRegions.length; r++) {
            let region = enterRegions[r]; 
            this.fsm.actOnEvent('enter', region); 
            //console.log("enter"); 
        }

        //order of event delivery - press, move_inside, release, release_none 
        //delivered in reverse drawing order 
        if (what === 'press') {
            for (let r : number = 0; r < curRegion.length; r++) {
                let region = curRegion[r]; 
                this.fsm.actOnEvent('press', region);
            }
            //console.log("press");

        } else if (what === 'move') {
            for (let r : number = 0; r < curRegion.length; r++) {
                let region = curRegion[r]; 
                this.fsm.actOnEvent('move_inside', region);
                
            }
            
            
        } else if (what === 'release') {
            if (curRegion.length > 0 ) {
                //only dispatch release events if there are current regions to release
                for (let r : number = 0; r < curRegion.length; r++) {
                    let region = curRegion[r]; 
                    this.fsm.actOnEvent('release', region);
                }
                //console.log("release");
            } else {
                //release none 
                this.fsm.actOnEvent('release_none'); 
            }
        }
        this._prevRegions = curRegion;

    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to begin an asychnous load of a FSM_json object from a remotely loaded 
    // .json file.  This object is then transformed into an FSM object to control
    // this object.  This method starts the loading process and sets up follow-on 
    // (asynchonous) actions, but then immediately returns.  In the asynchronous follow-on
    // actios, if the loading fails, Err.emit() is called with an appropriate message, 
    // and this._fsm is set to undefined.  When/if loading completes, the data is 
    // unpacked into an FSM_json object which is in turn used by FSM.fromJson() to create 
    // an FSM object installed as our fsm property.  Finally we declare damage to our 
    // parent object to arrange for redraw with the newly installed FSM.
    public async startLoadFromJson(jsonLoc : string) {
        // try to load the json text from the given location
        const response = await fetch(jsonLoc);

        if (!response.ok) {
            Err.emit(`Load of FSM from "${jsonLoc}" failed`)
            this._fsm = undefined;
            return;
        }

        //  parse the json into an (alledged) FSM_json object
        const data : FSM_json = await response.json();

        // validate and build an actual FSM object out of that
        this._fsm = FSM.fromJson(data, this);

         // we just changed everything, so declare damage
         this.damage();
    }   
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
} // end class FSMInteractor 

//===================================================================
