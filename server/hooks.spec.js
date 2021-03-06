const hooks = require('./hooks');
const { ErrToxic } = require('./errors');

// Mock out the perspective api call.
jest.mock('./perspective');

describe('talk-plugin-tisane', () => {
  describe('hooks', () => {
    beforeEach(() => {
      require('./tisane').setValues({ isToxic: false });
    });

    it('sets the correct values for a toxic comment', async () => {
      let input = { body: 'This is a body.', checkAbuse: false };
      await hooks.RootMutation.createComment.pre(null, { input }, null, null);
      expect(input).toHaveProperty('status', 'SYSTEM_WITHHELD');
    });

    it('throws an error when a toxic comment is sent', async () => {
      expect.assertions(1);
      await expect(
        hooks.RootMutation.createComment.pre(
          null,
          { input: { checkAbuse: true } },
          null,
          null
        )
      ).rejects.toBeInstanceOf(ErrToxic);
    });
  });
});
