describe('homepage', () => {
  it('loads', () => {
    cy.visit('/')
    cy.contains('MessageYOU')
  })
})
