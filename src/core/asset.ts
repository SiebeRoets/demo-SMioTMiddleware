export class Asset {
  // properties
  assetId: number;
  assetType: string;
  assetName:string
  devices:Array<number>;//id's of the devices coupled with this asset
  coupledAssets: any; //object with key value pairs (maybe consistsOf, owns rules with a list of items coupled to that property)
  //properties?

  //constructor
  constructor(assetId: number,name:string, type: string, devices: number[], assets:any) {
      this.assetId = assetId;
      this.assetName=name;
      this.assetType = type;
      this.devices = devices;
      this.coupledAssets= assets;
  }

  //methods

  giveJSONformat(){
    var obj={
      __uuid:this.assetId,
      type:this.assetType,
      name:this.assetName,
      relatedDevices:this.devices,
      relatedAssets:this.coupledAssets
    };
    return obj;
  }
  toString() {
      var result = "[" + this.assetId + " " + this.assetType;
      // @ts-ignore
      if (this.devices.size > 0)
          this.devices.forEach((value) => result = result.concat(" (" + value + ")"));
      if (this.coupledAssets.size > 0)
          this.coupledAssets.forEach((value, key) => result = result.concat(" (" + key + ", " + value + ")"));
      result = result.concat("]");
      return result;
  }
}