/**
 * MBTI-style travel personality quiz binary tree.
 * Extracted from openclaw-modified.html — do not edit manually.
 *
 * Each node: { id, question, choices[] }
 * Each choice: { label, tags[], dims{}, scene, axis, val, next: node|null }
 */

const tree = {
  id: 'root',
  question: 'The escape you need right now is—',
  choices: [
    {
      label: 'Just close by\nenough to breathe',
      tags: ['Micro-trip', 'Easy', 'Enough'],
      dims: { escape: -0.2, restful: 0.8 },
      scene: 'slow',
      axis: 'distance', val: 0,
      next: {
        id: 'near',
        question: 'Your ideal pace for that trip—',
        choices: [
          {
            label: 'Stay in one place\nuntil you have had your fill',
            tags: ['Slow', 'Deep', 'Unhurried'],
            dims: { slow: 0.9, dense: -0.4 },
            scene: 'camp',
            axis: 'pace', val: 0,
            next: {
              id: 'near-slow',
              question: 'What do you want to be surrounded by—',
              choices: [
                {
                  label: 'Mountains, sea, forest\nstay with nature',
                  tags: ['Nature', 'Healing', 'Serene'],
                  dims: { nature: 0.9, urban: -0.3 },
                  scene: 'nature',
                  axis: 'experience', val: 0,
                  next: {
                    id: 'near-slow-nature',
                    question: 'And how do you want to go?',
                    choices: [
                      {
                        label: 'Solo\ntotal quiet',
                        tags: ['Solitude', 'Recharge', 'Free'],
                        dims: { solo: 0.9, social: -0.4 },
                        scene: 'hiking',
                        axis: 'social', val: 0,
                        next: null
                      },
                      {
                        label: 'Friends or partner\nshare the wilderness',
                        tags: ['Companionship', 'Connection', 'Resonance'],
                        dims: { solo: -0.3, social: 0.8 },
                        scene: 'camp',
                        axis: 'social', val: 1,
                        next: null
                      }
                    ]
                  }
                },
                {
                  label: 'Streets and cafes\nwander the city',
                  tags: ['City', 'Culture', 'Street life'],
                  dims: { nature: -0.3, urban: 0.9 },
                  scene: 'urban',
                  axis: 'experience', val: 1,
                  next: {
                    id: 'near-slow-urban',
                    question: 'Your best travel state is—',
                    choices: [
                      {
                        label: 'Solo, no plan\njust roam and rest',
                        tags: ['Solo', 'At ease', 'Flowing'],
                        dims: { solo: 0.9, spontaneous: 0.8 },
                        scene: 'museum',
                        axis: 'social', val: 0,
                        next: null
                      },
                      {
                        label: 'Meet people, feel the buzz\nblend into local life',
                        tags: ['Social', 'Local', 'Lively'],
                        dims: { social: 0.9, local: 0.8 },
                        scene: 'izakaya',
                        axis: 'social', val: 1,
                        next: null
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: 'Move every day\nmany places, fast',
            tags: ['Fast', 'Many stops', 'Dense'],
            dims: { slow: -0.3, dense: 0.9 },
            scene: 'busy',
            axis: 'pace', val: 1,
            next: {
              id: 'near-fast',
              question: 'What do you want to be surrounded by—',
              choices: [
                {
                  label: 'Mountains, sea, forest\nstay with nature',
                  tags: ['Nature', 'Healing', 'Serene'],
                  dims: { nature: 0.9, urban: -0.3 },
                  scene: 'hiking',
                  axis: 'experience', val: 0,
                  next: {
                    id: 'near-fast-nature',
                    question: 'Your expectation for this trip—',
                    choices: [
                      {
                        label: 'Just go\nno plans needed',
                        tags: ['Spontaneous', 'Free', 'No planning'],
                        dims: { spontaneous: 0.9, luxury: -0.4 },
                        scene: 'go',
                        axis: 'comfort', val: 0,
                        next: null
                      },
                      {
                        label: 'Hand-pick it all\nstay and experience must fit',
                        tags: ['Quality', 'Particular', 'Refined'],
                        dims: { luxury: 0.8, aesthetic: 0.7 },
                        scene: 'hotel',
                        axis: 'comfort', val: 1,
                        next: null
                      }
                    ]
                  }
                },
                {
                  label: 'Streets and cafes\nwander the city',
                  tags: ['City', 'Culture', 'Street life'],
                  dims: { nature: -0.3, urban: 0.9 },
                  scene: 'urban',
                  axis: 'experience', val: 1,
                  next: {
                    id: 'near-fast-urban',
                    question: 'Your best travel state is—',
                    choices: [
                      {
                        label: 'Solo sweep\ncover the city efficiently',
                        tags: ['Solo', 'At ease', 'Efficient'],
                        dims: { solo: 0.9, dense: 0.7 },
                        scene: 'museum',
                        axis: 'social', val: 0,
                        next: null
                      },
                      {
                        label: 'Meet people, feel the buzz\nblend into local life',
                        tags: ['Social', 'Local', 'Lively'],
                        dims: { social: 0.9, local: 0.8 },
                        scene: 'izakaya',
                        axis: 'social', val: 1,
                        next: null
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      label: 'Fly out\nfar enough to truly leave',
      tags: ['Far', 'Big adventure', 'Abroad'],
      dims: { escape: 0.9, restful: -0.2 },
      scene: 'nature',
      axis: 'distance', val: 1,
      next: {
        id: 'far',
        question: 'Your ideal pace for that trip—',
        choices: [
          {
            label: 'Stay in one place\nuntil you have had your fill',
            tags: ['Slow', 'Deep', 'Unhurried'],
            dims: { slow: 0.9, dense: -0.4 },
            scene: 'camp',
            axis: 'pace', val: 0,
            next: {
              id: 'far-slow',
              question: 'What do you want to be surrounded by—',
              choices: [
                {
                  label: 'Mountains, sea, forest\nstay with nature',
                  tags: ['Nature', 'Healing', 'Serene'],
                  dims: { nature: 0.9, urban: -0.3 },
                  scene: 'nature',
                  axis: 'experience', val: 0,
                  next: {
                    id: 'far-slow-nature',
                    question: 'Quality of travel for you—',
                    choices: [
                      {
                        label: 'Just a backpack\nsleep anywhere',
                        tags: ['Spontaneous', 'Light pack', 'Free'],
                        dims: { spontaneous: 0.9, luxury: -0.5 },
                        scene: 'go',
                        axis: 'comfort', val: 0,
                        next: null
                      },
                      {
                        label: 'The right hotel matters\nhand-picked experience',
                        tags: ['Quality', 'Refined', 'Particular'],
                        dims: { luxury: 0.8, aesthetic: 0.8 },
                        scene: 'hotel',
                        axis: 'comfort', val: 1,
                        next: null
                      }
                    ]
                  }
                },
                {
                  label: 'Streets and cafes\nwander the city',
                  tags: ['City', 'Culture', 'Street life'],
                  dims: { nature: -0.3, urban: 0.9 },
                  scene: 'urban',
                  axis: 'experience', val: 1,
                  next: {
                    id: 'far-slow-urban',
                    question: 'Your best travel state is—',
                    choices: [
                      {
                        label: 'Solo, no plan\njust roam and rest',
                        tags: ['Solo', 'At ease', 'Flowing'],
                        dims: { solo: 0.9, spontaneous: 0.8 },
                        scene: 'museum',
                        axis: 'social', val: 0,
                        next: null
                      },
                      {
                        label: 'Meet people, feel the buzz\nblend into local life',
                        tags: ['Social', 'Local', 'Connection'],
                        dims: { social: 0.9, local: 0.8 },
                        scene: 'izakaya',
                        axis: 'social', val: 1,
                        next: null
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            label: 'Move every day\nmany places, fast',
            tags: ['Fast', 'Many stops', 'Wide'],
            dims: { slow: -0.3, dense: 0.9 },
            scene: 'busy',
            axis: 'pace', val: 1,
            next: {
              id: 'far-fast',
              question: 'What do you want to be surrounded by—',
              choices: [
                {
                  label: 'Mountains, sea, forest\nstay with nature',
                  tags: ['Nature', 'Adventure', 'Frontier'],
                  dims: { nature: 0.9, urban: -0.3 },
                  scene: 'hiking',
                  axis: 'experience', val: 0,
                  next: {
                    id: 'far-fast-nature',
                    question: 'Facing an unknown place, you—',
                    choices: [
                      {
                        label: 'Just go\nresearch on the way',
                        tags: ['Spontaneous', 'Adventure', 'No plan'],
                        dims: { spontaneous: 0.9, planned: -0.3 },
                        scene: 'go',
                        axis: 'comfort', val: 0,
                        next: null
                      },
                      {
                        label: 'Plan it fully\nevery detail in place',
                        tags: ['Planned', 'Quality', 'Assured'],
                        dims: { planned: 0.9, luxury: 0.6 },
                        scene: 'plan',
                        axis: 'comfort', val: 1,
                        next: null
                      }
                    ]
                  }
                },
                {
                  label: 'Streets and cafes\nwander the city',
                  tags: ['City', 'International', 'Exotic'],
                  dims: { nature: -0.3, urban: 0.9 },
                  scene: 'urban',
                  axis: 'experience', val: 1,
                  next: {
                    id: 'far-fast-urban',
                    question: 'Your best travel state is—',
                    choices: [
                      {
                        label: 'Solo and open\ntake whatever comes',
                        tags: ['Solo', 'Spontaneous', 'Free'],
                        dims: { solo: 0.8, spontaneous: 0.9 },
                        scene: 'local',
                        axis: 'social', val: 0,
                        next: null
                      },
                      {
                        label: 'Meet people, feel the buzz\nblend into local life',
                        tags: ['Social', 'Connection', 'Hunting'],
                        dims: { social: 0.9, adventure: 0.7 },
                        scene: 'izakaya',
                        axis: 'social', val: 1,
                        next: null
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
};

export default tree;
