import Ember from 'ember';
import ENV from '../../config/environment';
export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  featureService: Ember.inject.service('feature-service'),
  status: 'Unsaved.',

  domain: 'foobar.com',
  siteId: '3ef',
  siteName: 'Test Site Foobar.com',

  actions: {
    save () {
      if (!this.get('domain')) {
        this.set('status', 'Domain can not be empty');
        return;
      }
      if (!this.get('siteId')) {
        this.set('status', 'Site Id can not be empty');
        return;
      }
      // check if there is an entry for domain...
      let url = ENV.APP.domainServiceUrl; // 'https://services.arcgis.com/bkrWlSKcjUDFDtgw/arcgis/rest/services/sitedomains/FeatureServer/0';
      let options = {
        includeGeometry: false,
        outFields: '*'
      };
      options.where = encodeURI("domain='" + this.get('domain') + "'");
      this.get('featureService').query(url, options)
      .then((results) => {
        if (results.features.length) {
          // entry already exists
          this.set('status', 'Entry for that domain exists.');
          throw new Error('Entry for that domain exists');
        } else {
          // construct the row and save it...
          let feature = {
            geometry: null,
            attributes: {
              domain: this.get('domain'),
              siteId: this.get('siteId'),
              siteTitle: this.get('siteName'),
              clientKey: this.get('clientKey')
            }
          };
          let token = this.get('session.token');

          return this.get('featureService').addFeature(url, feature, token);
        }
      })
      .then((addResponse) => {
        if (addResponse.addResults.length === 1) {
          this.set('status', 'Saved.');
          this.transitionToRoute('sites');
        }
      })
      .catch((err) => {
        this.set('status', err.message);
      });
    }
  }
});
