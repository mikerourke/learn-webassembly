/**
 * This component is displayed when a user attempts to delete a
 * transaction. We don't want them accidentally deleting something!
 */
export default {
  name: 'confirmation-modal',
  props: {
    onNoClick: Function,
    onYesClick: Function
  },
  template: `
    <div id="confirmationModal" uk-modal bg-close="false">
      <div class="uk-modal-dialog uk-modal-body">
        <h2 class="uk-modal-title">Confirmation</h2>
        <p>Are you sure you want to delete this transaction?</p>
        <div class="uk-align-right">
          <button
            @click="onNoClick"
            class="uk-button uk-button-default uk-margin-small-right"
          >
            No
          </button>
          <button
            @click="onYesClick"
            class="uk-button uk-button-primary"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  `
};
