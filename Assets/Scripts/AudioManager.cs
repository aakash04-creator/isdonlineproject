using UnityEngine;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Audio manager providing procedural SFX generation and audio playback
    /// with pitch variation for organic gameplay feedback.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        [SerializeField] private AudioSource sfxSource;
        [SerializeField] private AudioSource musicSource;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (sfxSource == null)
            {
                sfxSource = gameObject.AddComponent<AudioSource>();
            }
        }

        public void PlaySound(AudioClip clip, float volume = 1f, float pitchVariation = 0.1f)
        {
            if (clip == null || sfxSource == null) return;

            sfxSource.pitch = 1f + Random.Range(-pitchVariation, pitchVariation);
            sfxSource.PlayOneShot(clip, volume);
        }
    }
}

