export class Asset {
  // properties
  assetId: number;
  type: string;
  assetName:string
  devices:Array<number>;//id's of the devices coupled with this asset
  coupledAssets: any; //object with key value pairs (maybe consistsOf, owns rules with a list of items coupled to that property)
  //properties?

  //constructor
  constructor(assetId: number, type: string, devices: number[], assets:any) {
      this.assetId = assetId;
      this.type = type;
      this.devices = devices;
      this.coupledAssets= assets;
  }

  //methods

  giveJSONformat(){
    var obj={
      __uuid:this.assetId,
      type:this.type,
      name:this.assetName,
      relatedDevices:this.devices,
      relatedAssets:this.coupledAssets
    };
  }
  toString() {
      var result = "[" + this.assetId + " " + this.type;
      // @ts-ignore
      if (this.devices.size > 0)
          this.devices.forEach((value) => result = result.concat(" (" + value + ")"));
      if (this.coupledAssets.size > 0)
          this.coupledAssets.forEach((value, key) => result = result.concat(" (" + key + ", " + value + ")"));
      result = result.concat("]");
      return result;
  }
}