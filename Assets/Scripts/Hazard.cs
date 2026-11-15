using UnityEngine;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Moving obstacle or hazard that resets player to checkpoint on contact.
    /// </summary>
    public class Hazard : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private Vector3 moveOffset = new Vector3(2f, 0, 0);
        [SerializeField] private float speed = 2f;

        private Vector3 startPos;

        private void Start()
        {
            startPos = transform.position;
        }

        private void Update()
        {
            float pingPong = Mathf.PingPong(Time.time * speed, 1f);
            transform.position = Vector3.Lerp(startPos, startPos + moveOffset, pingPong);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                LevelManager.Instance?.RestartLevel();
            }
        }
    }
}
